import { Displacement, displacement, hasDisplacement, Position } from "../card/movement";
import { PhoenixLiveViewPushEventHandler } from "../card/card";

export default class CardConnector {
  private previousPosition: Position;
  private connectorStart: Position;
  private connectorEnd: Position;


  private mouseMoveTriggered: boolean = false;
  private readonly pushEvent: PhoenixLiveViewPushEventHandler;
  private readonly element: HTMLElement;

  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler) {
    this.pushEvent = pushEvent;
    this.element = element;
    element.addEventListener('mousedown', this.handleDragStart);
  }

  private handleDragStart = (event: MouseEvent): void => {
    console.log('browser:card-connector:mousedown');

    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    // Stop any interaction for mouse events

    this.setPreviousPosition(event);
    event.stopImmediatePropagation();
  }

  private handleDrag = (event: MouseEvent): void => {
    console.log('browser:card-connector:mousemove');

    const newDisplacement = displacement({ x: this.previousPosition.x, y: this.previousPosition.y }, { x: event.clientX, y: event.clientY });

    // Guard clause, no need to do anything if mouse movement hasn't happened.
    if (!hasDisplacement(newDisplacement)) return;

    this.setPreviousPosition(event);

    this.mouseMoveTriggered = true;
  };

  private handleDragEnd = (event: MouseEvent): void => {
    console.log('browser:card:mouseup');

    // TODO: (@blakedietz) - potentially performance sensitive code
    if (this.mouseMoveTriggered && this.element && isTargetChildOfCard(document.querySelectorAll(".card"), event)) {
      console.log('phx:card-connector:card-drag-end');
      this.pushEvent('card-drag-end', { data: { y: this.element?.offsetTop, x: this.element?.offsetLeft, id: this?.element?.dataset?.cardId } });
    }

    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);

    this.mouseMoveTriggered = false;
  };

  private setPreviousPosition(event: MouseEvent): CardConnector {
    this.previousPosition = {
      x: event.clientX,
      y: event.clientY
    };

    return this;
  };

  private setElementDOMPosition({ δx, δy }: Displacement): CardConnector {
    this.element.style.left = `${this.element.offsetLeft - δx}px`;
    this.element.style.top = `${this.element.offsetTop - δy}px`;
    return this;
  };
}

const isTargetChildOfCard = (cards: NodeList, event: MouseEvent): boolean => {
  const result = [...cards].find((element) => {
    if (event.target) {
      return element.contains(event.target);
    }
    return false;
  });

  return result !== undefined;
};

