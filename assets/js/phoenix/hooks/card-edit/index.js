const CardEdit = {
  mouseMoveTriggered: false,
  mounted() {
    this.el.addEventListener('mouseup', (event) => {
      console.log('browser:card-edit:mouseup')
      event.stopImmediatePropagation();
    });
  }
};


export default CardEdit;
