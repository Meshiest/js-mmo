import GameObject from './GameObject.js';
import world from './World.js';

export default class Entity extends GameObject {
  constructor(type, pos) {
    super();
    this.type = type;
    this.pos = pos;
  }

  // Gets on-screen position from world position
  getScreenPos() {
    let { x, y } = this.pos;

    x -= world.controlEntity.pos.x;
    y -= world.controlEntity.pos.y;

    let hypot = Math.hypot(x, y);
    let theta = Math.atan2(y, x) + world.rotation;

    x = Math.cos(theta) * hypot;
    y = Math.sin(theta) * hypot * world.tilt;

    return { x, y };
  }

  // Standard sorting algorithm for Entities
  // Sort by y component after rotating by specified angle
  getOrder() {
    return Math.sin(Math.atan2(this.pos.y, this.pos.x) + world.rotation) *
      Math.hypot(this.pos.x, this.pos.y);
  }
}