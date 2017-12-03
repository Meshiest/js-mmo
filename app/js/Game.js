import { load } from './Assets.js';
import world from './World.js';
import { connect } from './Networking.js';
import Player from './Player.js';

import './Input.js';

let now = Date.now();

// eslint-disable-next-line
let hud = document.getElementById('hud');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

function resizeContext() {
  return {
    width: ctx.canvas.width = canvas.clientWidth,
    height: ctx.canvas.height = canvas.clientHeight,
  };
}

function renderGame() {
  requestAnimationFrame(renderGame);

  let { width, height } = resizeContext();

  let time = Date.now();
  // Calculate deltaTime (time between frames)
  const deltaTime = (time - now) / 1000;
  now = time;

  ctx.save();
  // Center the frame
  ctx.translate(width/2, height/2);

  // Tick the world and all entities
  world.tick(deltaTime);

  // Render the world and all entities
  world.render(ctx);

  ctx.restore();
}

window.addEventListener('load', () => {
  load().then(() => {
    world.entities.push(world.controlEntity = new Player(
      location.search ? location.search.slice(1) : 'Player',
      {x: 0, y: 0},
      {x: 0, y: 0},
      {x: 0, y: 1},
    ));
    world.controlEntity.setPlayerControlled(true);
    world.gen();
    connect().then(socket => {
      world.socket = socket;
      renderGame();
    });
  });
});