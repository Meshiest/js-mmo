module.exports = class Entity {
  constructor(type, pos) {
    this.type = type;
    this.pos = pos;
  }

  tick(deltaTime) {}
  render(ctx) {}
};