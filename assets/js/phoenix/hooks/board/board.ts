import Card from "../card/card";
import CardConnector from "../card-connector/card-connector";
import { createMachine, interpret } from "xstate";
import { PhoenixLiveViewPushEventHandler } from "../card/card";

export default class Board {

  private cards: Array<Card> = [];
  private connections: Map<string, CardConnector> = new Map();
  private draggedCards: Array<Card> = [];
  private draggedConnection: { fromId: string | null, toId: string | null } = { fromId: null, toId: null };
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
    this.draggedCards.push(card);
    this.boardService.send({ type: 'MOUSE_DOWN_ON_CARD', cardId: card.id });
  }

  private handleCardMouseUp = (card, event: MouseEvent): void => {
    // TODO: (@blakedietz) - move this out into the machine context
    this.draggedCards = [];
    this.boardService.send({ type: 'MOUSE_UP_ON_CARD', cardId: card.id });
  }

  private handleConnectorDragStart = (cardId: string, event: MouseEvent): void => {
    this.boardService.send({ type: 'MOUSE_DOWN_ON_CARD_CONNECTOR', cardId });

    this.draggedConnection.fromId = cardId;
  };

  private makeMachine() {
    const boardMachine = createMachine({
      predictableActionArguments: true,
      id: 'board',
      initial: 'viewing',
      states: {
        viewing: {
          on: {
            MOUSE_DOWN_ON_BOARD: 'mouseDownOnBoard',
            MOUSE_DOWN_ON_CARD: 'mouseDownOnCard',
            MOUSE_DOWN_ON_CARD_CONNECTOR: 'mouseDownOnCardConnection',
          }
        },
        mouseDownOnBoard: {
          on: {
            MOUSE_MOVE: 'draggingSelection',
            MOUSE_UP_ON_BOARD: {
              target: 'cardEditorOpen',
              actions: ['createCard']
            },
            MOUSE_UP_ON_CARD: 'cardEditorOpen',
          }
        },
        draggingSelection: {
          on: {
            MOUSE_OVER_CARD: 'draggingSelectionWithMultipleCards',
          }
        },
        draggingSelectionWithMultipleCards: {
          on: {
            MOUSE_UP_ON_BOARD: 'viewingMultipleCardsSelected',
            MOUSE_UP_ON_CARD: 'viewingMultipleCardsSelected',
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
              actions: ['clickCard']
            },
          }
        },
        draggingCard: {
          on: {
            MOUSE_MOVE: {
              target: 'draggingCard',
              actions: ['dragCard']
            },
            MOUSE_UP_ON_BOARD: {
              target: 'viewing',
              actions: ['dropCard']
            },
          },
        },
        mouseDownOnCardConnection: {
          on: {
            MOUSE_MOVE: 'draggingConnection'
          }
        },
        draggingConnection: {
          on: {
            MOUSE_MOVE: {
              target: 'draggingConnection',
              actions: ['draggingConnection']
            },
            MOUSE_UP_ON_BOARD: {
              target: 'viewing',
              actions: ['createCard', 'hideTemporaryConnection']
            },
            MOUSE_UP_ON_CARD: {
              target: 'cardEditorOpen',
              actions: ['dropConnectionOnCard', 'hideTemporaryConnection']
            },
          }
        },
        cardEditorOpen: {
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
            this.draggedCards.forEach((card) => {
              card.drag(event);
            });
            this.connections.forEach((connection) => {
              connection.render();
            });
          },
          dropCard: (context, event) => {
            this.draggedCards.forEach(card => {
              this.pushEvent('card-drag-end', { data: { ...card.getCoordinates(), id: card.id } });
            });
            this.draggedCards = [];
          },
          clickCard: (context, { cardId: id }) => {
            this.pushEvent('card-clicked', { data: { id } });
          },
          draggingConnection: (context, { event }) => {
            const originatingCard = this.cards.find(card => card.id === this.draggedConnection.fromId);
            const targetedCard = this.cards.find(card => card.containsEventTarget(event));

            const { x: startX, y: startY } = originatingCard.getConnectorCoordinates();
            const { x: endX, y: endY } = targetedCard ? targetedCard.getConnectorCoordinates() : { x: event.offsetX, y: event.offsetY };

            document.querySelector("#unconnected-connector path").setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
            document.querySelector("#unconnected-connector path")?.classList.remove('hidden');
          },
          dropConnectionOnCard: (context, { cardId }) => {
            this.pushEvent('card-connected', { data: { previous_node_id: this.draggedConnection.fromId, next_node_id: cardId } });
            this.draggedConnection.fromId = null;
          },
          hideTemporaryConnection: (context, _) => {
            document.querySelector("#unconnected-connector path")?.classList.add('hidden');
          }
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
