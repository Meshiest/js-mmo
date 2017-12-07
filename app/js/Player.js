import Entity from './Entity.js';
import Tree from './Tree.js';
import {
  PLAYER_SPEED,
  KEYBINDS,
  TILE_DIST,
} from './Config.js';
import { drawAvatar, vecToDir } from './Rendering.js';
import { getAssets } from './Assets.js';
import { keys } from './Input.js';
import world from './World.js';


export default class Player extends Entity {
  constructor(name, pos, vel, dir) {
    super('player', pos);
    this.goal = pos;
    this.vel = vel;
    this.name = name;
    this.dir = dir;
    this.isPlayerControlled = false;
    this.tilesheet = getAssets().avatars;
    this.avatarIndex = 6;

    this.lastPos = {
      x: pos.x,
      y: pos.y,
    };
  }

  setPlayerControlled(isPlayerControlled) {
    this.genAround();
    this.isPlayerControlled = isPlayerControlled;
  }

  tick(deltaTime) {
    if(this.isPlayerControlled) {
      this.controlTick(deltaTime);
    } else {
      this.clientTick(deltaTime);
    }

    // Increment frame for walking animations
    if(Math.hypot(this.vel.x, this.vel.y) > 0) {
      this.frame += Math.hypot(this.vel.x, this.vel.y) / 20 * deltaTime;
      if(this.isPlayerControlled)
        world.socket.emit('transform', this.getTransform());
    } else {
      if(this.frame !== 0 && this.isPlayerControlled) {
        world.socket.emit('transform', this.getTransform());
      }
      this.frame = 0;
    }
  }

  getTransform() {
    return {
      pos: this.pos,
      vel: this.vel,
      dir: this.dir,
    };
  }

  // Tick for the controlling player
  controlTick(deltaTime) {
    let dir = {x: 0, y: 0};

    if(keys[KEYBINDS.PLAYER_UP])
      dir.y -= 1;
    if(keys[KEYBINDS.PLAYER_DOWN])
      dir.y += 1;

    if(keys[KEYBINDS.PLAYER_LEFT])
      dir.x -= 1;
    if(keys[KEYBINDS.PLAYER_RIGHT])
      dir.x += 1;

    if(Math.hypot(dir.x, dir.y) > 0) {
      let theta = Math.atan2(dir.y, dir.x);
      dir = {
        x: Math.cos(theta - world.rotation),
        y: Math.sin(theta - world.rotation),
      };
      this.dir = dir;

      this.vel.x = dir.x * PLAYER_SPEED;
      this.vel.y = dir.y * PLAYER_SPEED;

      this.pos.x += this.vel.x * deltaTime;
      this.pos.y += this.vel.y * deltaTime;

      // Shift the world so it follows the player
      world.offset.x += Math.cos(theta) * PLAYER_SPEED * deltaTime;
      world.offset.y += Math.sin(theta) * world.tilt * PLAYER_SPEED * deltaTime;
    } else {
      this.vel.x = 0;
      this.vel.y = 0;
    }

    if(Math.hypot(this.lastPos.x - this.pos.x, this.lastPos.y - this.pos.y) > 48) {
      // To be removed with requesting from the network
      this.genAround();

      this.lastPos.x = this.pos.x;
      this.lastPos.y = this.pos.y;
    }
  }

  clientTick(deltaTime) {
    // Glide the player towards the actual position
    // This will make networking look less laggy
    this.pos.x += (this.goal.x - this.pos.x) * deltaTime * 10;
    this.pos.y += (this.goal.y - this.pos.y) * deltaTime * 10;
  }

  genAround() {
    let { x, y } = this.pos;
    x = Math.floor(x/32);
    y = Math.floor(y/32);

    let tiles = [0, 0, 4, 6, 48];
    let sample = () => tiles[Math.floor(Math.random() * tiles.length)];
    let list = [];

    for(let i = -TILE_DIST; i < TILE_DIST; i++)
      for(let j = -TILE_DIST; j < TILE_DIST; j++) {
        let tx = i + x, ty = j + y;

        if(typeof world.mapGrid[[tx, ty]] === 'undefined') {
          list.push({x: tx, y: ty, t: sample()});
          if(Math.random() < 0.05)
            world.entities.push(new Tree({
              x: tx * 32 + 16,
              y: ty * 32 + 16
            }));
        }
      }

    world.setTiles(list);
  }

  render(ctx) {
    let { x, y } = this.getScreenPos();

    // Render Player
    drawAvatar(ctx,
      this.tilesheet,
      this.avatarIndex,
      Math.floor(this.frame),
      vecToDir(this.dir, world.rotation),
      x, y);

    ctx.font = 'small-caps bold 13px helvetica';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';

    // Render Username
    ctx.strokeText(this.name, x, y - 48);
    ctx.fillText(this.name, x, y - 48);
  }
}