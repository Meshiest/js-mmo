export default class Entity {
  constructor(type, pos) {
    this.type = type;
    this.pos = pos;
  }


  // Standard sorting algorithm for Entities
  // Sort by y component after rotating by specified angle
  getOrder(rotation) {
    return Math.sin(Math.atan2(this.pos.y, this.pos.x) + rotation) *
      Math.hypot(this.pos.x, this.pos.y);
  }

  /* eslint no-unused-vars: off */

  // Interface for basic entity implementation
  tick(deltaTime) {}
  render(ctx, rotation, offset, tilt) {}
}