import {
  Displacement,
  Position,
  displacement,
  hasDisplacement,
} from "./movement";

export type PhoenixLiveViewPushEventHandler = (event: string, payload: object, onReply?: (reply: any, ref: any) => void) => void;

export default class Card {
  constructor(element: HTMLElement, pushEvent: PhoenixLiveViewPushEventHandler) {
    this.pushEvent = pushEvent;
    this.element = element;
  }
}
