import { getBoard } from "../board/board-singleton";

const CardConnectorHook = {
  cardConnector: null,
  mounted() {
    getBoard()
      .addConnection(this)
      .renderConnection(this);
  },
  updated() {
    getBoard()
      .renderConnection(this);
  }
}

export default CardConnectorHook;
