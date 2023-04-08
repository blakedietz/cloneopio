const Board = {
  mounted() {
    console.log('board mounted');
    this.el.addEventListener('click', () => {
      console.log('clicked');
    });
  }
};

export default Board;
