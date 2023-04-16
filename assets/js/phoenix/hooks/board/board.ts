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

  private cards: Array<HTMLElement>;
  private draggedCards: Array<HTMLElement> = [];

  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler) {
    // @ts-ignore
    this.cards = [...document.querySelectorAll('.card')];

    this.element = element;
    this.element.addEventListener('mousedown', this.handleDragStart);
    // this.element.addEventListener('click', this.handleClick);

    this.pushEvent = pushEvent;
  }

  private handleDragStart = (event: MouseEvent): void => {
    console.log('browser:board:mousedown');

    // @ts-ignore
    const targetedCard = this.findTargetedCard(this.cards, event);

    if (targetedCard) {
      // @ts-ignore
      this.draggedCards.push(targetedCard);
      this.handleCardDragStart(event);
    }

    // Stop any interaction for mouse events

    this.setPreviousDragPosition(event);
  }

  private handleClick = (event: MouseEvent): void => {
    console.log('browser:board:mouseup');
    console.log('phx:board:user-clicked-board');

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
