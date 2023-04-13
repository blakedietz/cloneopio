const Card = {
  mouseMoveTriggered: false,
  mounted() {
    const handleDragStart = (event) => {
      console.log('browser:card:mousedown');
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.querySelector('#board').style.pointerEvents = 'none';
    };

    const handleDrag = (event) => {
      console.log('browser:card:mousemove');

      this.el.style.top = `${event.offsetY}px`;
      this.el.style.left = `${event.offsetX}px`;

      this.mouseMoveTriggered = true;
    };

    const handleDragEnd = (event) => {
      console.log('browser:card:mouseup');

      if (this.mouseMoveTriggered) {
        console.log('phx:card:card-drag-end');
        this.pushEvent('card-drag-end', { data: { y: event.offsetY, x: event.offsetX, id: this.el.dataset.cardId } });
      }
      else {
        console.log('phx:card:card-clicked');
        this.pushEvent('card-clicked', { data: { id: this.el.dataset.cardId } });
      }
      document.querySelector('#board').style.pointerEvents = 'auto';
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    this.el.addEventListener('mousedown', handleDragStart);
  }
};


export default Card;
