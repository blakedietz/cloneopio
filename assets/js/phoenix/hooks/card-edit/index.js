const CardEdit = {
  hasAttached: false,
  updated() {
    if (this.el.dataset.isVisible === 'true') {
      this.hasAttached = true;
      this.el.querySelector('textarea').addEventListener('mouseup', (event) => {
        event.stopPropagation();
      });
    }
  }
};


export default CardEdit;
