import GameObject from './GameObject.js';
import world from './World.js';

export default class Entity extends GameObject {
  constructor(type, pos) {
    super();
    this.type = type;
    this.pos = pos;
  }

  // Standard sorting algorithm for Entities
  // Sort by y component after rotating by specified angle
  getOrder() {
    return Math.sin(Math.atan2(this.pos.y, this.pos.x) + world.rotation) *
      Math.hypot(this.pos.x, this.pos.y);
  }
}