import { getBoard } from "./board-singleton";
const BoardHook = {
  mounted() {
    getBoard()
      .setHookInstance(this);

  },
  destroyed() {
    // TODO: (@blakedietz) - notify the board and reset
  }
};

export default BoardHook;
