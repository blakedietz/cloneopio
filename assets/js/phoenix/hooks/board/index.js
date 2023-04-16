import Board from "./board";

const BoardHook = {
  board: null,
  mounted() {
    this.board = new Board(this.el, this.pushEvent.bind(this));
  },
  destroyed() {
    delete this.board;
  }
};

export default BoardHook;
