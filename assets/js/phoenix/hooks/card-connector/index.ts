import CardConnector from "./card-connector";
import { getBoard } from "../board/board-singleton";
const CardConnectorHook = {
  cardConnector: null,
  mounted() {
    getBoard().addConnection(this.el);

    this.cardConnector = new CardConnector(this.el);
    this.cardConnector.render();
  },
  updated() {
    this.cardConnector.render();
  }
}

export default CardConnectorHook;
