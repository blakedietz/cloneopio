const CardEdit = {
  mouseMoveTriggered: false,
  mounted() {
    this.el.addEventListener('mouseup', (event) => {
      console.log('browser:card-edit:mouseup')
      // Don't want mouseup making its way to the document level handlers
      event.stopImmediatePropagation();
    });
  }
};


export default CardEdit;
