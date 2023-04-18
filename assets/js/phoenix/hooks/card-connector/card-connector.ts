export default class CardConnector {
  private readonly hookInstance;

  constructor(hookInstance) {
    this.hookInstance = hookInstance;
  }

  public render() {
    const path = this.element.querySelector('path');
    const originatingCard = document.querySelector(`#cards-${this.element.dataset.previousNodeId}`);
    const originatingCardConnector = document.querySelector(`#card-connector-${this.element.dataset.previousNodeId}`);
    const cardConnector = originatingCardConnector?.getBoundingClientRect();
    const targetedCard = document.querySelector(`#cards-${this.element.dataset.nextNodeId}`);
    const targetedCardConnector = document.querySelector(`#card-connector-${this.element.dataset.nextNodeId}`)

    const startX = originatingCard.offsetLeft + originatingCardConnector.offsetLeft + (cardConnector.width / 2);
    const startY = originatingCard.offsetTop + originatingCardConnector.offsetTop + (cardConnector.height / 2);


    const endX = targetedCard.offsetLeft + targetedCardConnector.offsetLeft + (cardConnector.width / 2);
    const endY = targetedCard.offsetTop + targetedCardConnector.offsetTop + (cardConnector.height / 2);

    path.setAttribute('d', `m${startX},${startY} q90,40 ${endX - startX},${endY - startY}`);
  }

  get id() {
    return this.element.dataset.edgeId;
  }

  get previousNodeId() {
    return this.element.dataset.previousNodeId;
  }

  get nextNodeId() {
    return this.element.dataset.nextNodeId;
  }

  get element() {
    return this.hookInstance.el;
  }
}

