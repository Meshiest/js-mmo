import Entity from './Entity.js';
import { drawTile } from './Rendering.js';
import { getAssets } from './Assets.js';

export default class Tree extends Entity {
  constructor(pos) {
    super('tree', pos);
    this.tilesheet = getAssets().decorations;
    this.avatarIndex = 6;
  }

  render(ctx) {
    let { x, y } = this.getScreenPos();

    // Render Tree
    drawTile(ctx,
      this.tilesheet,
      50,
      32, 64,
      x - 16, y - 60);
  }
}