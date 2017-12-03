import { keys } from './Input.js';

let world = new (class World {
  constructor() {
    this.tilt = 0.5;
    this.rotation = Math.PI / 4;
    this.offset = {
      x: 0,
      y: 0,
    };
  }

  tick(deltaTime) {
    if(keys.KeyZ)
      this.tilt -= 2 * deltaTime;
    if(keys.KeyX)
      this.tilt += 2 * deltaTime;
    this.tilt = Math.min(Math.max(this.tilt, 0.4), 0.6);
  }
});

export default { world };