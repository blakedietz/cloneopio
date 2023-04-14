export default class Card {
  x: string | null = null;
  y: string | null = null;

  private mouseMoveTriggered: boolean = false;
  private readonly pushEvent: (message: string, event: { data: object }) => void;
  private readonly element: HTMLElement | null = null;

  constructor(element: HTMLElement, pushEvent) {
    this.pushEvent = pushEvent;
    this.element = element;
    this.x = element.style.left;
    this.y = element.style.top;
    element.addEventListener('mousedown', this.handleDragStart);
  }

  coordinates() {
    return { x: this.x, y: this.y };
  }

  handleDragStart = (_event: MouseEvent) => {
    console.log('browser:card:mousedown');

    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    // Stop any interaction for mouse events
    const board: HTMLElement | null = document.querySelector('#board');
    if (board) {
      board.style.pointerEvents = 'none';
    }
  }

  handleDrag = (event: MouseEvent) => {
    console.log('browser:card:mousemove');

    // TODO: (@blakedietz) - fix this code to use the previous top and left and take the difference to make a translation
    if (this.element) {
      this.element.style.top = `${event.offsetY}px`;
      this.element.style.left = `${event.offsetX}px`;
    }

    this.mouseMoveTriggered = true;
  }

  handleDragEnd = (event: MouseEvent) => {
    console.log('browser:card:mouseup');

    if (this.mouseMoveTriggered) {
      console.log('phx:card:card-drag-end');
      this.pushEvent('card-drag-end', { data: { y: event.offsetY, x: event.offsetX, id: this?.element?.dataset?.cardId } });
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
  }
}
