import {
  Displacement,
  Position,
  displacement,
  hasDisplacement,
} from "../card/movement";

import { PhoenixLiveViewPushEventHandler } from "../card/card";

export default class Board {
  previousPosition: Position;

  private mouseMoveTriggered: boolean = false;

  private readonly element: HTMLElement;
  private readonly pushEvent: PhoenixLiveViewPushEventHandler;
  private readonly handleEvent;

  private cards: Array<HTMLElement>;
  private edges: Map<string, [{ fromId: string, toId: string | null }]>;;
  private draggedCards: Array<HTMLElement> = [];
  private draggedConnection: { fromId: string | null, toId: string | null } = { fromId: null, toId: null };

  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler, handleEvent) {
    // @ts-ignore
    this.cards = [...document.querySelectorAll('.card')];
    this.cards.forEach(card => {
      card
        ?.querySelector('.card-connector')
        ?.addEventListener('mousedown', (event) => this.handleConnectorDragStart(card.dataset.cardId, event));
    });

    this.element = element;
    this.element.addEventListener('mousedown', this.handleDragStart);
    // TODO: (@blakedietz) - this is not working as expected when dragging card connectors
    this.element.addEventListener('click', this.handleClick);

    this.pushEvent = pushEvent;
    this.handleEvent = handleEvent;

    this.handleEvent('edge-created', this.handleEdgeCreated);
    this.edges = new Map();
  }

  private handleEdgeCreated = (data) => {
    const { edge: { previous_node_id: fromId, next_node_id: toId } } = data;
    const edgesForCard = this.edges.get(fromId) ?? [];

    this.edges.set(fromId, [...edgesForCard, data.edge]);
  };

  private handleConnectorDragStart = (cardId: string, event: MouseEvent): void => {
    event.stopPropagation();
    console.log('browser:board:card-connector:mousedown');
    this.draggedConnection.fromId = cardId;
    document.querySelector('#board').addEventListener('mousemove', this.handleConnectorDrag);
    document.querySelector('#board').addEventListener('mouseup', this.handleConnectorDragEnd);

    this.setPreviousDragPosition(event);
  };

  private handleConnectorDrag = (event: MouseEvent): void => {
    console.log('browser:board:card-connector:mousemove');

    const originatingCard = document.querySelector(`#cards-${this.draggedConnection.fromId}`);
    const originatingCardConnector = document.querySelector(`#card-connector-${this.draggedConnection.fromId}`);
    const cardConnector = originatingCardConnector?.getBoundingClientRect();
    const targetedCard = this.cards.find(cardElement => cardElement.contains(event.target))

    if (targetedCard) {
      const startX = originatingCard.offsetLeft + originatingCardConnector.offsetLeft + (cardConnector.width / 2);
      const startY = originatingCard.offsetTop + originatingCardConnector.offsetTop + (cardConnector.height / 2);

      const targetedCardConnector = document.querySelector(`#card-connector-${targetedCard.dataset.cardId}`);

      const endX = targetedCard.offsetLeft + targetedCardConnector.offsetLeft + (cardConnector.width / 2);
      const endY = targetedCard.offsetTop + targetedCardConnector.offsetTop + (cardConnector.height / 2);

      document.querySelector("#unconnected-connector path").setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
    }
    else {
      const startX = originatingCard.offsetLeft + originatingCardConnector.offsetLeft + (cardConnector.width / 2);
      const startY = originatingCard.offsetTop + originatingCardConnector.offsetTop + (cardConnector.height / 2);

      const endX = event.offsetX;
      const endY = event.offsetY;

      document.querySelector("#unconnected-connector path").setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
    }

    document.querySelector("#unconnected-connector path")?.classList.remove('hidden');

    this.setPreviousDragPosition(event);
    this.mouseMoveTriggered = true;
  };

  private handleConnectorDragEnd = (event: MouseEvent): void => {
    const targetedCard = this.cards.find(cardElement => cardElement.contains(event.target));

    if (targetedCard) {
      // TODO: (@blakedietz) - check if already dragged over existing card that's connected
      this.pushEvent('card-connected', { data: { previous_node_id: this.draggedConnection.fromId, next_node_id: targetedCard.dataset.cardId } }, (reply, ref) => {
        console.log({ reply, ref });
      });
    }
    else {
      this.pushEvent('create-card-with-connection', { data: {} })
      this.pushEvent('user-clicked-board', { data: { fromId: this.draggedConnection.fromId, y: event.offsetY, x: event.offsetX } });
    }
    event.stopImmediatePropagation();
  };

  private handleDragStart = (event: MouseEvent): void => {
    console.log('browser:board:mousedown');

    // @ts-ignore
    const targetedCard = this.findTargetedCard(this.cards, event);

    if (targetedCard) {
      // @ts-ignore
      this.draggedCards.push(targetedCard);
      this.handleCardDragStart(event);
    }

    this.setPreviousDragPosition(event);
  }

  private handleClick = (event: MouseEvent): void => {
    console.log('browser:board:mouseup');
    console.log('phx:board:user-clicked-board');

    // TODO: (@blakedietz) - once a card is created add it to the board may want to do this from the card hook instead
    this.pushEvent('user-clicked-board', { data: { y: event.offsetY, x: event.offsetX } });
  };

  private handleCardDragStart = (event: MouseEvent): void => {
    console.log('browser:board:mousedown');

    document.addEventListener('mousemove', this.handleCardDrag);
    document.addEventListener('mouseup', this.handleCardDragEnd, { once: true });
    // Stop any interaction for mouse events

    this.setPreviousDragPosition(event);
  }

  private handleCardDrag = (event: MouseEvent): void => {
    console.log('browser:board:mousemove');

    const newDisplacement = displacement({ x: this.previousPosition.x, y: this.previousPosition.y }, { x: event.clientX, y: event.clientY });

    // Guard clause, no need to do anything if mouse movement hasn't happened.
    if (!hasDisplacement(newDisplacement)) return;

    this.draggedCards.forEach((card) => {
      // console.log(event.target);
      this.setElementDOMPosition(card, newDisplacement);
      // TODO: (@blakedietz) - set card connection positions
    })

    this.setPreviousDragPosition(event);

    this.mouseMoveTriggered = true;
  };

  private handleCardDragEnd = (_event: MouseEvent): void => {
    console.log('browser:board:mouseup');

    if (this.mouseMoveTriggered) {
      console.log('phx:board:card-drag-end');
      // TODO: (@blakedietz) - fix this to send out data for all moved cards
      // this.pushEvent('card-drag-end', { data: { y: this.element?.offsetTop, x: this.element?.offsetLeft, id: this?.element?.dataset?.cardId } });
    }
    else {
      console.log('phx:board:card-clicked');
      this.pushEvent('card-clicked', { data: { id: this?.element?.dataset?.cardId } });
    }

    document.removeEventListener('mousemove', this.handleCardDrag);

    this.mouseMoveTriggered = false;
    this.draggedCards = [];
  };

  private setPreviousDragPosition(event: MouseEvent): Board {
    this.previousPosition = {
      x: event.clientX,
      y: event.clientY
    };

    return this;
  };

  private setElementDOMPosition(element: HTMLElement, { δx, δy }: Displacement): void {
    // console.log({ δx, δy, left: element.style.left, top: element.style.top, offsetLeft: element.offsetLeft, offsetTop: element.offsetTop })
    element.style.left = `${element.offsetLeft - δx}px`;
    element.style.top = `${element.offsetTop - δy}px`;
  };

  private findTargetedCard(cards: [Element], event: MouseEvent): Element | undefined {
    const result = cards.find((element) => {
      if (event.target) {
        // @ts-ignore
        return element.contains(event.target);
      }
      return false;
    });

    return result;
  };

  private isTargetChildOfCard(cards: [Element], event: MouseEvent): boolean {
    const targetedCard = this.findTargetedCard(cards, event)

    return targetedCard !== undefined;
  };
};
