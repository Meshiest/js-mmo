import { keys } from './Input.js';
import GameObject from './GameObject.js';
import { getAssets } from './Assets.js';
import { drawTile } from './Rendering.js';
import {
  KEYBINDS,
  RENDER_DIST,
  MAP_SIZE,
  FADE_RANGE,
} from './Config.js';

const RENDER_RADIUS = RENDER_DIST/2;

let world = new (class World extends GameObject {
  constructor() {
    super();
    this.tilt = 0.5;
    this.rotation = Math.PI / 4;
    this.offset = {
      x: 0,
      y: 0,
    };

    this.entities = [];

    this.map = document.createElement('canvas');
    this.mapCtx = this.map.getContext('2d');
    this.mapCtx.canvas.width = MAP_SIZE;
    this.mapCtx.canvas.height = MAP_SIZE;
  }

  gen() {
    let tiles = [0, 0, 0, 4, 6, 48];
    let sample = () => tiles[Math.floor(Math.random() * tiles.length)];
    for(let i = 0; i < MAP_SIZE / 32; i++)
      for(let j = 0; j < MAP_SIZE / 32; j++)
        drawTile(this.mapCtx, getAssets().tileset, sample(), 32, 32, i * 32, j * 32);
  }

  tick(deltaTime) {
    if(keys[KEYBINDS.WORLD_TILT_DOWN])
      this.tilt -= 2 * deltaTime;
    if(keys[KEYBINDS.WORLD_TILT_UP])
      this.tilt += 2 * deltaTime;

    this.tilt = Math.min(Math.max(this.tilt, 0.4), 0.6);

    // Keybinds for rotating world
    if(keys[KEYBINDS.WORLD_ROTATE_CCW])
      this.rotation += deltaTime * Math.PI / 2;
    if(keys[KEYBINDS.WORLD_ROTATE_CW])
      this.rotation -= deltaTime * Math.PI / 2;

    /// Smooth translate world to center at player
    this.offset.x -= this.offset.x * deltaTime * 4;
    this.offset.y -= this.offset.y * deltaTime * 4;

    this.entities.forEach(e => e.tick(deltaTime));
  }

  render(ctx) {
    ctx.translate(this.offset.x, this.offset.y);
    let controlPos = this.controlEntity.pos;

    ctx.save();
    ctx.scale(1, world.tilt);
    ctx.rotate(world.rotation);
    ctx.fillRect(-RENDER_RADIUS-2, -RENDER_RADIUS-2, RENDER_DIST+4, RENDER_DIST+4);
    ctx.drawImage(this.map,
      controlPos.x-RENDER_RADIUS, controlPos.y-RENDER_RADIUS,
      RENDER_DIST, RENDER_DIST,
      -RENDER_RADIUS, -RENDER_RADIUS,
      RENDER_DIST, RENDER_DIST);
    ctx.restore();

    ctx.save();

    this.entities.map(e => {
      e.__order = e.getOrder();
      return e;
    }).sort((a, b) =>
      a.__order - b.__order // TODO Use an even faster sort
    ).forEach(e => {
      let posX = e.pos.x - controlPos.x;
      let posY = e.pos.y - controlPos.y;
      // Cull anything not in the rendering range
      if((Math.abs(posX) > RENDER_RADIUS ||
        Math.abs(posY) > RENDER_RADIUS))
        return;

      ctx.save();

      // Fade when close to edge of render distance
      if(Math.abs(e.pos.x - controlPos.x) > RENDER_RADIUS - FADE_RANGE ||
          Math.abs(e.pos.y - controlPos.y) > RENDER_RADIUS - FADE_RANGE) {
        ctx.globalAlpha = Math.min(
          Math.abs(RENDER_RADIUS - Math.abs(posX)) / FADE_RANGE,
          Math.abs(RENDER_RADIUS - Math.abs(posY)) / FADE_RANGE);
      } else {
        ctx.globalAlpha = 1;
      }

      e.render(ctx);

      ctx.restore();
    });

    ctx.restore();
  }
});

module.exports = world;