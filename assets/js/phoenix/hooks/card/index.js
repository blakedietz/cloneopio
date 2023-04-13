const Card = {
  mounted() {
    const handleDragStart = (event) => {
      console.log('card:mousedown');
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.querySelector('#board').style.pointerEvents = 'none';
    };

    const handleDrag = (event) => {
      console.log('card:mousemove');
      this.el.style.top = `${event.offsetY}px`;
      this.el.style.left = `${event.offsetX}px`;
    };

    const handleDragEnd = (event) => {
      console.log('card:mouseup');
      this.pushEvent('card-drag-end', { data: { y: event.offsetY, x: event.offsetX, id: this.el.dataset.cardId } });
      document.querySelector('#board').style.pointerEvents = 'auto';
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    this.el.addEventListener('mousedown', handleDragStart);
  }
};


export default Card;
