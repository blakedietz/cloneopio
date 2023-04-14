import CardConnector from "./card-connector";
const CardConnectorHook = {
  cardConnector: null,
  mounted() {
    // TODO: (@blakedietz) - note this is a bad assumption with parentElement, should probably wire in more specific way of specifying.
    this.cardConnector = new CardConnector(this.el, this.pushEvent.bind(this));
  }
}

export default CardConnectorHook;
