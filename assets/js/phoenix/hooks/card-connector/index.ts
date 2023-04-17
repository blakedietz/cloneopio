import CardConnector from "./card-connector";
const CardConnectorHook = {
  cardConnector: null,
  mounted() {
    this.cardConnector = new CardConnector(this.el);
    this.cardConnector.render();
  },
  updated() {
    this.cardConnector.render();
  }
}

export default CardConnectorHook;
