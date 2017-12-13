import { keys } from './Input.js';
import GameObject from './GameObject.js';
import sort from 'fast-sort';
import { getAssets } from './Assets.js';
import { autoTile } from './Rendering.js';
import {
  KEYBINDS,
  RENDER_DIST,
  MAP_SIZE,
  FADE_RANGE,
  DEBUG
} from './Config.js';

const RENDER_RADIUS = RENDER_DIST/2;

const ADJACENT = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];

let world = new (class World extends GameObject {
  constructor() {
    super();
    this.tilt = 0.5;
    this.rotation = Math.PI / 4;
    this.offset = {
      x: 0,
      y: 0,
    };

    window.addEventListener('blur', () => {
      this.offset.x = this.offset.y = 0;
    });

    window.addEventListener('keydown', event => {
      if(event.code === KEYBINDS.WORLD_RESET_PERSPECTIVE) {
        this.rotation = Math.PI / 4;
        this.tilt = 0.5;
      }
    });

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.height = this.ctx.canvas.width = RENDER_DIST;

    this.entities = [];

    this.maps = {};
    this.mapGrid = {};
  }

  // Returns an existing canvas ctx pair or creates a new one
  getMap(x, y, grid) {
    let pos;
    if(!grid)
      pos = [Math.floor(x / MAP_SIZE), Math.floor(y / MAP_SIZE)];
    else
      pos = [x, y];

    if(this.maps[pos])
      return this.maps[pos];

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    this.maps[pos] = {
      canvas, ctx
    };

    ctx.canvas.width = MAP_SIZE * 32;
    ctx.canvas.height = MAP_SIZE * 32;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, MAP_SIZE * 32, MAP_SIZE * 32);

    return this.maps[pos];
  }

  // Assign a set of tiles to the map, autotiles neighboring tiles
  setTiles(list) {
    let near = {};
    for(let i = 0; i < list.length; i++) {
      let { x, y, t } = list[i];
      this.mapGrid[[x,y]] = t;
      near[[x, y]] = [x, y];

      for(let j = 0; j < 8; j++) {
        let key = [ADJACENT[j][0] + x, ADJACENT[j][1] + y];
        near[key] = key;
      }
    }

    for(let k in near) {
      this.adjustTile(...near[k]);
    }
  }

  // Runs the autotile code
  adjustTile(x, y) {
    let cell = this.mapGrid[[x, y]];

    let edge = 0;
    for(let i = 0; i < 8; i++)
      edge += (cell === this.mapGrid[[ADJACENT[i][0]+x, ADJACENT[i][1]+y]] ? 1 : 0) << i;

    autoTile(this.getMap(x, y).ctx,
      getAssets().groundedges,
      cell,
      edge,
      x * 32 - Math.floor(x / MAP_SIZE) * MAP_SIZE * 32,
      y * 32 - Math.floor(y / MAP_SIZE) * MAP_SIZE * 32
    );
  }

  tick(deltaTime) {
    if(keys[KEYBINDS.WORLD_TILT_DOWN] && !keys[KEYBINDS.WORLD_RESET_PERSPECTIVE])
      this.tilt -= 2 * deltaTime;
    if(keys[KEYBINDS.WORLD_TILT_UP] && !keys[KEYBINDS.WORLD_RESET_PERSPECTIVE])
      this.tilt += 2 * deltaTime;

    this.tilt = Math.min(Math.max(this.tilt, 0.3), 0.7);

    // Keybinds for rotating world
    if(keys[KEYBINDS.WORLD_ROTATE_CCW] && !keys[KEYBINDS.WORLD_RESET_PERSPECTIVE])
      this.rotation += deltaTime * Math.PI / 2;
    if(keys[KEYBINDS.WORLD_ROTATE_CW] && !keys[KEYBINDS.WORLD_RESET_PERSPECTIVE])
      this.rotation -= deltaTime * Math.PI / 2;

    /// Smooth translate world to center at player
    this.offset.x -= this.offset.x * deltaTime * 4;
    this.offset.y -= this.offset.y * deltaTime * 4;

    for(let i in this.entities)
      this.entities[i].tick(deltaTime);
  }

  renderMap(x, y) {
    // let map = this.getMap(x, y);
    // let canvas = map.canvas;
    let xGrid = Math.round(x / 32 / MAP_SIZE);
    let yGrid = Math.round(y / 32 / MAP_SIZE);

    // drawImage(image, imgX, imgY, imgW, imgH, x, y, w, h)
    this.ctx.save();
    this.ctx.translate(-x + RENDER_RADIUS, -y + RENDER_RADIUS);

    [[0, 0], [-1, 0], [0, -1], [-1, -1]].forEach(p => {
      let map = this.getMap(xGrid + p[0], yGrid + p[1], 1);
      this.ctx.drawImage(map.canvas,
        (xGrid + p[0]) * 32 * MAP_SIZE,
        (yGrid + p[1]) * 32 * MAP_SIZE);

      if(DEBUG.CHUNK) {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#fff';
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px arial';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(
          `${xGrid + p[0]}, ${yGrid + p[1]}`,
          (xGrid + p[0]) * 32 * MAP_SIZE + 20,
          (yGrid + p[1]) * 32 * MAP_SIZE + 20);
        this.ctx.strokeRect(
          (xGrid + p[0]) * 32 * MAP_SIZE + 8,
          (yGrid + p[1]) * 32 * MAP_SIZE + 8,
          32 * MAP_SIZE -16,
          32 * MAP_SIZE -16);
      }
    });

    this.ctx.restore();

  }

  render(ctx) {
    ctx.translate(this.offset.x, this.offset.y);
    let controlPos = this.controlEntity.pos;

    this.renderMap(controlPos.x, controlPos.y);

    ctx.save();
    ctx.scale(1, world.tilt);
    ctx.rotate(world.rotation);
    ctx.fillRect(-RENDER_RADIUS-2, -RENDER_RADIUS-2, RENDER_DIST+4, RENDER_DIST+4);
    ctx.drawImage(this.canvas,
      0, 0,
      RENDER_DIST, RENDER_DIST,
      -RENDER_RADIUS, -RENDER_RADIUS,
      RENDER_DIST, RENDER_DIST);
    ctx.restore();

    ctx.save();

    this.entities = sort(this.entities)
    .asc(e => e.getOrder());
    for(let i in this.entities) {
      let e = this.entities[i];
      let posX = e.pos.x - controlPos.x;
      let posY = e.pos.y - controlPos.y;
      // Cull anything not in the rendering range
      if((Math.abs(posX) > RENDER_RADIUS ||
        Math.abs(posY) > RENDER_RADIUS))
        continue;

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
    }

    ctx.restore();
  }
});

module.exports = world;