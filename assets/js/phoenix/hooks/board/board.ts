import Card from "../card/card";
import CardConnector from "../card-connector/card-connector";
import { createMachine, interpret, assign } from "xstate";
import { PhoenixLiveViewPushEventHandler } from "../card/card";

export default class Board {

  private cards: Array<Card> = [];
  private connections: Map<string, CardConnector> = new Map();
  private hookInstance;
  private boardService;

  get pushEvent(): PhoenixLiveViewPushEventHandler {
    return this.hookInstance.pushEvent.bind(this.hookInstance);
  }

  get element() {
    return this.hookInstance.el;
  }

  public setHookInstance = (hookInstance) => {
    this.hookInstance = hookInstance;
    this.makeMachine();

    return this;
  };

  public addCard = (hookInstance) => {
    const newCard = new Card(hookInstance)
      .addMouseDownHandlerToConnector(this.handleConnectorDragStart)
      .addMouseDownHandler(this.handleCardMouseDown)
      .addMouseUpHandler(this.handleCardMouseUp);

    this.cards.push(newCard);

    return this;
  }

  public cardUpdated = () => {
    this.connections.forEach((connection) => {
      connection.render();
    });

    return this;
  };

  public addConnection = (hookInstance) => {
    const newCardConnection = new CardConnector(hookInstance)
    this.connections.set(newCardConnection.id, newCardConnection);

    return this;
  };

  public renderConnection = (hookInstance) => {
    // TODO: (@blakedietz) - fix this api so you don't need to know the details of dataset
    this.connections.get(hookInstance.el.dataset.edgeId).render();

    return this;
  };

  private handleMouseDown = (event: MouseEvent) => {
    this.boardService.send({ type: 'MOUSE_DOWN_ON_BOARD', event });
  };

  private handleMouseUp = (event: MouseEvent) => {
    this.boardService.send({ type: 'MOUSE_UP_ON_BOARD', event });
  };

  private handleMouseMove = (event: MouseEvent) => {
    this.boardService.send({ type: 'MOUSE_MOVE', event });
  };

  private handleCardMouseDown = (card, event: MouseEvent): void => {
    // TODO: (@blakedietz) - move this out into the machine context
    // event.stopPropagation();
    console.log('card mouse down');
    this.boardService.send({ type: 'MOUSE_DOWN_ON_CARD', card });
  }

  private handleCardMouseUp = (card, event: MouseEvent): void => {
    event.stopPropagation();
    // TODO: (@blakedietz) - move this out into the machine context
    this.boardService.send({ type: 'MOUSE_UP_ON_CARD', card });
  }

  private handleConnectorDragStart = (card, event: MouseEvent): void => {
    event.stopPropagation();
    this.boardService.send({ type: 'MOUSE_DOWN_ON_CARD_CONNECTOR', card });
  };

  private makeMachine() {
    const boardMachine = createMachine({
      predictableActionArguments: true,
      id: 'board',
      initial: 'viewing',
      context: {
        cards: new Map(),
        selectedCards: new Map(),
        connectionDraggedFromCard: null
      },
      states: {
        viewing: {
          on: {
            MOUSE_DOWN_ON_BOARD: 'mouseDownOnBoard',
            MOUSE_DOWN_ON_CARD: 'mouseDownOnCard',
            MOUSE_DOWN_ON_CARD_CONNECTOR: {
              target: 'mouseDownOnCardConnection',
              actions: ['setConnectionDraggedFromCard']
            },
          }
        },
        mouseDownOnBoard: {
          on: {
            MOUSE_UP_ON_BOARD: {
              target: 'cardEditorOpen',
              actions: ['createCard']
            },
            MOUSE_UP_ON_CARD: 'cardEditorOpen',
          }
        },
        draggingSelectionWithMultipleCards: {
          on: {
            MOUSE_UP_ON_BOARD: 'viewingMultipleCardsSelected',
            MOUSE_UP_ON_CARD: '',
          }
        },
        viewingMultipleCardsSelected: {
          on: {
            MOUSE_UP_ON_BOARD: 'viewing',
          }
        },
        mouseDownOnCard: {
          on: {
            MOUSE_MOVE: 'draggingCard',
            MOUSE_UP_ON_CARD: {
              target: 'cardEditorOpen',
              actions: ['clickCard', 'removeAllSelectedCards']
            },
          },
          entry: ['addCardToSelectedCards']
        },
        draggingCard: {
          on: {
            MOUSE_MOVE: {
              target: 'draggingCard',
              actions: ['dragCard']
            },
            MOUSE_UP_ON_BOARD: {
              target: 'viewing',
              actions: ['dropCard', 'removeAllSelectedCards']
            },
            MOUSE_UP_ON_CARD: {
              target: 'viewing',
              actions: ['dropCard', 'removeAllSelectedCards']
            },
          },
        },
        mouseDownOnCardConnection: {
          on: {
            MOUSE_MOVE: {
              target: 'draggingConnection',
            }
          }
        },
        draggingConnection: {
          on: {
            MOUSE_MOVE: {
              target: 'draggingConnection',
              actions: ['draggingConnection']
            },
            MOUSE_UP_ON_BOARD: {
              target: 'cardEditorOpen',
              actions: ['dropConnectionOnBoard', 'hideTemporaryConnection']
            },
            MOUSE_UP_ON_CARD: {
              target: 'viewing',
              actions: ['dropConnectionOnCard', 'hideTemporaryConnection']
            },
          }
        },
        cardEditorOpen: {
          exit: ['hideEditor'],
          // entry: ['showEditor'],
          on: {
            MOUSE_UP_ON_BOARD: 'viewing',
            MOUSE_UP_ON_CARD: 'viewing',
          }
        },
      },
    },
      {
        actions: {
          createCard: (context, { event }) => {
            this.pushEvent('user-clicked-board', { data: { y: event.offsetY, x: event.offsetX } });
          },
          dragCard: (context, { event }) => {
            context.selectedCards.forEach((card) => {
              card.drag(event);
            });
            this.connections.forEach((connection) => {
              connection.render();
            });
          },
          dropCard: (context, event) => {
            context.selectedCards.forEach(card => {
              this.pushEvent('card-drag-end', { data: { ...card.getCoordinates(), id: card.id } });
            });
          },
          clickCard: (context, { card: { id } }) => {
            this.pushEvent('card-clicked', { data: { id } });
          },
          draggingConnection: (context, { event }) => {
            const originatingCard = context.connectionDraggedFromCard;
            const targetedCard = this.cards.find(card => card.containsEventTarget(event));

            const { x: startX, y: startY } = originatingCard.getConnectorCoordinates();
            const { x: endX, y: endY } = targetedCard ? targetedCard.getConnectorCoordinates() : { x: event.offsetX, y: event.offsetY };

            document.querySelector("#unconnected-connector path").setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
            document.querySelector("#unconnected-connector path")?.classList.remove('hidden');
          },
          dropConnectionOnCard: (context, { card }) => {
            this.pushEvent('card-connected', { data: { previous_node_id: context.connectionDraggedFromCard.id, next_node_id: card.id } });
          },
          dropConnectionOnBoard: (context, { cardId }) => {
            this.pushEvent('create-card-with-connection', { data: { previous_node_id: context.connectionDraggedFromCard.id, y: event.offsetY, x: event.offsetX } });
          },
          hideTemporaryConnection: (context, _) => {
            document.querySelector("#unconnected-connector path")?.classList.add('hidden');
          },
          hideEditor: () => {
            document.querySelector('#card-edit-modal')?.classList.add('hidden');
            this.pushEvent('card-edit:click-away', {});
          },
          showEditor: () => {
            document.querySelector('#card-edit-modal')?.classList.remove('hidden');
          },
          setConnectionDraggedFromCard: assign({
            connectionDraggedFromCard: (context, { card }) => {
              return card;
            }
          }),
          resetConnectionDraggedFromCard: assign({
            connectionDraggedFromCard: (context, _) => {
              return null;
            }
          }),
          addCardToSelectedCards: assign({
            selectedCards: (context, { card }) => {
              // TODO: (@blakedietz) - this is impure, need to look at smart ways to do this
              context.selectedCards.set(card.id, card)
              return context.selectedCards;
            }
          }),
          removeAllSelectedCards: assign({
            selectedCards: (context, { card }) => {
              return new Map();
            }
          }),
        }
      });

    const boardService = interpret(boardMachine, { devTools: true }).onTransition(state => console.log(state.value));
    boardService.start();

    this.boardService = boardService;
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mousemove', this.handleMouseMove);
  }
};
