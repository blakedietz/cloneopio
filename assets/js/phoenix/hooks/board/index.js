const Board = {
  currentlyDragging: null,
  mounted() {
    this.el.addEventListener('mouseup', (e) => {
      console.log('board:mouseup');
      this.pushEvent('user-clicked-board', { data: { y: e.offsetY, x: e.offsetX } });
    });
  }
};

export default Board;
