import { getBoard } from "./board-singleton";
const BoardHook = {
  mounted() {
    getBoard()
      .setElement(this.el)
      .setPushEvent(this.pushEvent.bind(this));

  },
  destroyed() {
    // TODO: (@blakedietz) - notify the board and reset
  }
};

export default BoardHook;
