import Card from "./card";
import { getBoard } from "../board/board-singleton";

const CardHook = {
  card: null,
  mounted() {
    getBoard()
      .addCard(this.el);

    this.card = new Card(this.el, this.pushEvent.bind(this));
  },
  destroyed() {
    delete this.card;
  }
};

export default CardHook;
