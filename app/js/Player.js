import Entity from './Entity.js';
import {
  RENDER_DIST,
  FADE_RANGE,
  PLAYER_SPEED,
} from './Config.js';
import { drawAvatar, vecToDir, assets } from './Rendering.js';
import { keys } from './Input.js';
import { world } from './World.js';

const RENDER_RADIUS = RENDER_DIST / 2;

export default class Player extends Entity {
  constructor(id, pos, name, vel, dir) {
    super('player', pos);
    this.id = id;
    this.goal = pos;
    this.vel = vel;
    this.name = name;
    this.dir = dir;
    this.isPlayerControlled = false;

    this.tilesheet = assets.avatars;
    this.avatarIndex = 6;
  }

  setPlayerControlled(isPlayerControlled) {
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
    } else {
      this.frame = 0;
    }
  }

  controlTick(deltaTime) {
    let dir = {x: 0, y: 0};

    if(keys.KeyW)
      dir.y -= 1;
    if(keys.KeyS)
      dir.y += 1;
    if(keys.KeyA)
      dir.x -= 1;
    if(keys.KeyD)
      dir.x += 1;

    if(Math.hypot(dir.x, dir.y) > 0) {
      let theta = Math.atan2(dir.y, dir.x);
      dir = {
        x: Math.cos(theta - world.rotation),
        y: Math.sin(theta - world.rotation),
      };
      this.lastDir = dir;

      this.vel.x = dir.x * PLAYER_SPEED;
      this.vel.y = dir.y * PLAYER_SPEED;

      this.pos.x += this.vel.x * deltaTime;
      this.pos.y += this.vel.y * deltaTime;

      // TODO Emit new transform
    }
  }

  clientTick(deltaTime) {
    // Glide the player towards the actual position
    // This will make networking look less laggy
    this.pos.x += (this.goal.x - this.pos.x) * deltaTime * 10;
    this.pos.y += (this.goal.y - this.pos.y) * deltaTime * 10;
  }

  render(ctx) {
    let { x, y } = this.pos;

    x -= world.offset.x;
    y -= world.offset.y;

    let hypot = Math.hypot(x, y);
    let theta = Math.atan2(y, x) + world.rotation;

    // Cull anything not in the rendering range
    if((Math.abs(x) > RENDER_RADIUS ||
        Math.abs(y) > RENDER_RADIUS))
      return;

    ctx.save();

    // Fade when close to edge of render distance
    if(Math.abs(x) > RENDER_RADIUS - FADE_RANGE ||
        Math.abs(y) > RENDER_RADIUS - FADE_RANGE) {
      ctx.globalAlpha = Math.min(
        Math.abs(RENDER_RADIUS - Math.abs(x)) / FADE_RANGE,
        Math.abs(RENDER_RADIUS - Math.abs(y)) / FADE_RANGE);
    } else {
      ctx.globalAlpha = 1;
    }

    x = Math.cos(theta) * hypot;
    y = Math.sin(theta) * hypot * world.tilt;

    // Render Player
    drawAvatar(ctx,
      this.tilesheet,
      this.avatarIndex,
      Math.floor(this.frame),
      vecToDir(this.lastDir, world.rotation),
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

    ctx.restore();
  }
}