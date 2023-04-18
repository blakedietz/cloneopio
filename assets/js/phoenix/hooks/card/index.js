import { getBoard } from "../board/board-singleton";

const CardHook = {
  mounted() {
    getBoard()
      .addCard(this);
  }
};

export default CardHook;
