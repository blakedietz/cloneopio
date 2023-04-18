import {
  Displacement,
  Position,
  displacement,
  hasDisplacement,
} from "../card/movement";
import Card from "../card/card";
import CardConnector from "../card-connector/card-connector";

import { PhoenixLiveViewPushEventHandler } from "../card/card";

export default class Board {
  previousPosition: Position;

  private mouseMoveTriggered: boolean = false;
  private element: HTMLElement;
  private pushEvent: PhoenixLiveViewPushEventHandler;

  private cards: Array<Card> = [];
  private connections: Map<string, CardConnector> = new Map();
  private draggedCards: Array<Card> = [];
  private draggedConnection: { fromId: string | null, toId: string | null } = { fromId: null, toId: null };

  public setElement = (element: HTMLElement) => {
    this.element = element;
    this.element.addEventListener('mousedown', this.handleDragStart);
    this.element.addEventListener('mouseup', this.handleClick);

    return this;
  }

  public setPushEvent = (pushEvent: PhoenixLiveViewPushEventHandler) => {
    this.pushEvent = pushEvent;

    return this;
  }

  public addCard = (hookInstance) => {
    const newCard = new Card(hookInstance).addMouseMoveHandlerToConnector(this.handleConnectorDragStart);
    this.cards.push(newCard);

    return this;
  }

  public cardUpdated = () => {
    console.log('example');

    this.connections.forEach((connection) => {
      connection.render();
    });

    return this;
  }


  public addConnection = (hookInstance) => {
    const newCardConnection = new CardConnector(hookInstance)
    this.connections.set(newCardConnection.id, newCardConnection);

    return this;
  }

  public renderConnection = (hookInstance) => {
    // TODO: (@blakedietz) - fix this api so you don't need to know the details of dataset
    this.connections.get(hookInstance.el.dataset.edgeId).render();

    return this;
  }

  private handleConnectorDragStart = (cardId: string, event: MouseEvent): void => {
    event.stopPropagation();
    console.log('browser:board:card-connector:mousedown');

    this.draggedConnection.fromId = cardId;
    this.element.addEventListener('mousemove', this.handleConnectorDrag);
    this.element.addEventListener('mouseup', this.handleConnectorDragEnd);
    this.element.removeEventListener('mouseup', this.handleClick);
  };

  private handleConnectorDrag = (event: MouseEvent): void => {
    console.log('browser:board:card-connector:mousemove');

    const originatingCard = this.cards.find(card => card.id === this.draggedConnection.fromId);
    const targetedCard = this.cards.find(card => card.containsEventTarget(event));

    const { x: startX, y: startY } = originatingCard.getConnectorCoordinates();
    const { x: endX, y: endY } = targetedCard ? targetedCard.getConnectorCoordinates() : { x: event.offsetX, y: event.offsetY };

    document.querySelector("#unconnected-connector path").setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
    document.querySelector("#unconnected-connector path")?.classList.remove('hidden');

    this.mouseMoveTriggered = true;
  };

  private handleConnectorDragEnd = (event: MouseEvent): void => {
    const targetedCard = this.cards.find(cardElement => cardElement.containsEventTarget(event));

    if (targetedCard) {
      // TODO: (@blakedietz) - check if already dragged over existing card that's connected
      this.pushEvent('card-connected', { data: { previous_node_id: this.draggedConnection.fromId, next_node_id: targetedCard.id } }, (reply, ref) => {
        console.log({ reply, ref });
      });
    }
    else {
      // TODO: (@blakedietz) - implement this server side
      this.pushEvent('create-card-with-connection', { data: { previous_node_id: this.draggedConnection.fromId, y: event.offsetY, x: event.offsetX } });
    }
    event.stopImmediatePropagation();
    this.element.removeEventListener('mousemove', this.handleConnectorDrag);
    this.element.removeEventListener('mouseup', this.handleConnectorDragEnd);
    this.element.addEventListener('mouseup', this.handleClick);
    document.querySelector("#unconnected-connector path")?.classList.add('hidden');
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
  }

  private handleClick = (event: MouseEvent): void => {
    if (event.target.id !== "board") return;

    console.log('browser:board:mouseup');
    console.log('phx:board:user-clicked-board');

    this.pushEvent('user-clicked-board', { data: { y: event.offsetY, x: event.offsetX } });
  };

  private handleCardDragStart = (event: MouseEvent): void => {
    console.log('browser:board:mousedown');

    document.addEventListener('mousemove', this.handleCardDrag);
    document.addEventListener('mouseup', this.handleCardDragEnd, { once: true });
  }

  private handleCardDrag = (event: MouseEvent): void => {
    console.log('browser:board:mousemove');
    this.draggedCards.forEach((card) => {
      card.drag(event);
    });
    this.connections.forEach((connection) => {
      connection.render();
    });

    this.mouseMoveTriggered = true;
  };

  private handleCardDragEnd = (event: MouseEvent): void => {
    console.log('browser:board:mouseup');
    const targetedCard = this.findTargetedCard(this.cards, event);

    if (targetedCard && this.mouseMoveTriggered) {
      console.log('phx:board:card-drag-end');
      // TODO: (@blakedietz) - fix this to send out data for all moved cards
      this.pushEvent('card-drag-end', { data: { ...targetedCard.getCoordinates(), id: targetedCard.id } });
    }
    else {
      console.log('phx:board:card-clicked');
      this.pushEvent('card-clicked', { data: { id: targetedCard.id } });
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

  private findTargetedCard(cards: [Card], event: MouseEvent): Card | undefined {
    const result = cards.find((card) => {
      if (event.target) {
        // @ts-ignore
        return card.containsEventTarget(event);
      }
      return false;
    });

    return result;
  };
};
