export type PhoenixLiveViewPushEventHandler = (event: string, payload: object, onReply?: (reply: any, ref: any) => void) => void;

export default class Card {
  private readonly hookInstance;

  constructor(hookInstance) {
    this.hookInstance = hookInstance;
  }

  public drag(event: MouseEvent) {
    const element = this.hookInstance.el;

    element.style.left = `${element.offsetLeft + event.movementX}px`;
    element.style.top = `${element.offsetTop + event.movementY}px`;
  }

  public getCoordinates() {
    const element = this.hookInstance.el;

    return { y: element?.offsetTop, x: element?.offsetLeft };
  }

  public addMouseDownHandlerToConnector(handler) {
    this.hookInstance.el
      ?.querySelector('.card-connector')
      ?.addEventListener('mousedown', (event) => handler(this.id, event));

    return this;
  }

  public addMouseDownHandler(handler) {
    this.element.addEventListener('mousedown', (event) => {
      handler(this, event);
    });

    return this;
  }

  public getConnectorCoordinates() {
    const cardElement = this.hookInstance.el;
    const cardConnectorElement = cardElement.querySelector('.card-connector');
    const { width: cardConnectorWidth, height: cardConnectorHeight } = cardConnectorElement.getBoundingClientRect();
    const x = cardElement.offsetLeft + cardConnectorElement.offsetLeft + (cardConnectorWidth / 2);
    const y = cardElement.offsetTop + cardConnectorElement.offsetTop + (cardConnectorHeight / 2);

    return { x, y };
  }

  public containsEventTarget = (event: MouseEvent): boolean => {
    return this.hookInstance.el.contains(event.target);
  }

  get id() {
    return this.hookInstance.el.dataset.cardId;
  }

  get element() {
    return this.hookInstance.el;
  }

}
