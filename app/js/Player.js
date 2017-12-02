import Entity from './Entity.js';
import { RENDER_DIST, FADE_RANGE } from './Config.js';
import { drawAvatar, vecToDir, assets } from './Rendering.js';

const RENDER_RADIUS = RENDER_DIST / 2;

export default class Player extends Entity {
  constructor(id, pos, name, vel, dir) {
    super('player', pos);
    this.id = id;
    this.goal = pos;
    this.vel = vel;
    this.name = name;
    this.dir = dir;

    this.tilesheet = assets.avatars;
    this.avatarIndex = 6;
  }

  tick(deltaTime) {
    // Glide the player towards the actual position
    // This will make networking look less laggy
    this.pos.x += (this.goal.x - this.pos.x) * deltaTime * 10;
    this.pos.y += (this.goal.y - this.pos.y) * deltaTime * 10;

    // Increment frame for walking animations
    if(this.vel.x * this.vel.y !== 0) {
      this.frame += Math.hypot(this.vel.x, this.vel.y) / 20 * deltaTime;
    } else {
      this.frame = 0;
    }
  }

  render(ctx, rotation, offset, tilt) {
    let { x, y } = this.pos;

    x -= offset.x;
    y -= offset.y;

    let hypot = Math.hypot(x, y);
    let theta = Math.atan2(y, x) + rotation;

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
    y = Math.sin(theta) * hypot * tilt;

    // Render Player
    drawAvatar(ctx,
      this.tilesheet,
      this.avatarIndex,
      Math.floor(this.frame),
      vecToDir(this.lastDir, rotation),
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