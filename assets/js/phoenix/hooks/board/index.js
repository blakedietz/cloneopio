const Board = {
  currentlyDragging: null,
  mounted() {
    this.el.addEventListener('click', (e) => {
      console.log('browser:board:mouseup');
      console.log('phx:board:user-clicked-board');
      this.pushEvent('user-clicked-board', { data: { y: e.offsetY, x: e.offsetX } });
    });
  }
};

export default Board;
