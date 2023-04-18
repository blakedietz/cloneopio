import { getBoard } from "../board/board-singleton";

const CardHook = {
  mounted() {
    getBoard()
      .addCard(this);
  },
  updated() {
    getBoard()
      .cardUpdated();
  }
};

export default CardHook;
