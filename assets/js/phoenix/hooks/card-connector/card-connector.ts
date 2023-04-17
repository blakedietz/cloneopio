export default class CardConnector {
  private readonly element: HTMLElement;

  constructor(element) {
    this.element = element;
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
}

