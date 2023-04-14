import { Displacement, displacement, hasDisplacement, Position } from "./movement";

type PhoenixLiveViewPushEventHandler = (event: string, payload: object, onReply?: (reply: any, ref: any) => void) => void;

export default class Card {
  previousMouseMoveX: number = 0;
  previousMouseMoveY: number = 0;
  previousPosition: Position;

  private mouseMoveTriggered: boolean = false;
  private readonly pushEvent: PhoenixLiveViewPushEventHandler;
  private readonly element: HTMLElement;

  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler) {
    this.pushEvent = pushEvent;
    this.element = element;
    element.addEventListener('mousedown', this.handleDragStart);
  }

  private handleDragStart = (event: MouseEvent) => {
    console.log('browser:card:mousedown');

    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    // Stop any interaction for mouse events
    const board: HTMLElement | null = document.querySelector('#board');
    if (board) {
      board.style.pointerEvents = 'none';
    }

    this.setPreviousPosition(event);
  }

  private handleDrag = (event: MouseEvent) => {
    console.log('browser:card:mousemove');

    const newDisplacement = displacement({ x: this.previousPosition.x, y: this.previousPosition.y }, { x: event.clientX, y: event.clientY });

    if (!hasDisplacement(newDisplacement)) return;

    this
      .setElementDOMPosition(newDisplacement)
      .setPreviousPosition(event);

    this.mouseMoveTriggered = true;
  }

  private handleDragEnd = (_event: MouseEvent) => {
    console.log('browser:card:mouseup');

    if (this.mouseMoveTriggered && this.element) {
      console.log('phx:card:card-drag-end');
      this.pushEvent('card-drag-end', { data: { y: this.element?.offsetTop, x: this.element?.offsetLeft, id: this?.element?.dataset?.cardId } });
    }
    else {
      console.log('phx:card:card-clicked');
      this.pushEvent('card-clicked', { data: { id: this?.element?.dataset?.cardId } });
    }
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);

    const board: HTMLElement | null = document.querySelector('#board');
    if (board) {
      board.style.pointerEvents = 'auto';
    }

    this.mouseMoveTriggered = false;
  }

  private setPreviousPosition(event: MouseEvent) {
    this.previousPosition = {
      x: event.clientX,
      y: event.clientY
    };

    return this;
  }

  private setElementDOMPosition({ δx, δy }: Displacement): Card {
    this.element.style.left = `${this.element.offsetLeft - δx}px`;
    this.element.style.top = `${this.element.offsetTop - δy}px`;
    return this;
  }
}
