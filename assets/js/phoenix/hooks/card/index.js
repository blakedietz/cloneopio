import Card from "./card";

const CardHook = {
  card: null,
  mounted() {
    // this.card = new Card(this.el, this.pushEvent.bind(this));
  },
  destroyed() {
    delete this.card;
  }
};

export default CardHook;
