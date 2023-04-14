import CardConnector from "./card-connector";
const CardConnectorHook = {
  cardConnector: null,
  mounted() {
    this.cardConnector = new CardConnector(this.el, this.pushEvent);
  }
}

export default CardConnectorHook;
