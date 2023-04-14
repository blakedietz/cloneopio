type PhoenixLiveViewPushEventHandler = (event: string, payload: object, onReply?: (reply: any, ref: any) => void) => void;

export default class Card {
  x: string | null = null;
  y: string | null = null;

  previousMouseMoveX: number = 0;
  previousMouseMoveY: number = 0;

  private mouseMoveTriggered: boolean = false;
  private readonly pushEvent: PhoenixLiveViewPushEventHandler;
  private readonly element: HTMLElement;

  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler) {
    this.pushEvent = pushEvent;
    this.element = element;
    this.x = element.style.left;
    this.y = element.style.top;
    element.addEventListener('mousedown', this.handleDragStart);
  }

  coordinates() {
    return { x: this.x, y: this.y };
  }

  handleDragStart = (event: MouseEvent) => {
    console.log('browser:card:mousedown');

    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    // Stop any interaction for mouse events
    const board: HTMLElement | null = document.querySelector('#board');
    if (board) {
      board.style.pointerEvents = 'none';
    }

    this.previousMouseMoveX = event.clientX;
    this.previousMouseMoveY = event.clientY;
  }

  handleDrag = (event: MouseEvent) => {
    console.log('browser:card:mousemove');

    // TODO: (@blakedietz) - fix this code to use the previous top and left and take the difference to make a translation
    const δx = this.previousMouseMoveX - event.clientX;
    const δy = this.previousMouseMoveY - event.clientY;

    if (δx === 0 && δy === 0) {
      return;
    }

    this.element.style.top = `${this.element.offsetTop - δy}px`;
    this.element.style.left = `${this.element.offsetLeft - δx}px`;

    this.previousMouseMoveX = event.clientX;
    this.previousMouseMoveY = event.clientY;

    this.mouseMoveTriggered = true;
  }

  handleDragEnd = (_event: MouseEvent) => {
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
}
