import Entity from './Entity.js';

module.exports = class Player extends Entity {
  constructor(id, pos, name, vel, dir) {
    super('player', pos);
    this.id = id;
    this.goal = pos;
    this.vel = vel;
    this.name = name;
    this.dir = dir;
  }

  tick(deltaTime) {

  }

  render(ctx) {

  }
};