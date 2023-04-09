const Board = {
  mounted() {
    this.el.addEventListener('click', (e) => {
      this.pushEvent('user-clicked-board', { data: { y: e.offsetY, x: e.offsetX } });
    });
  }
};

export default Board;
