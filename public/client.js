let assets = {
  // items: 'assets/bigset.png',
  //fluidset: 'https://vxresource.files.wordpress.com/2010/03/tilea1.png',
  //tileset: 'https://vxresource.files.wordpress.com/2010/03/tilea2.png',
  //groundset: 'http://vxresource.files.wordpress.com/2010/03/tilea5.png',
  //avatars: 'https://vxresource.files.wordpress.com/2010/03/vx_chara03_d.png',
  //plants: 'https://vxresource.files.wordpress.com/2010/02/plants2mp1.png',
  //decorations: 'http://vxresource.files.wordpress.com/2010/03/tileb.png',
  fluidset: 'assets/tilea1.png',
  tileset: 'assets/tilea2.png',
  groundset: 'assets/tilea5.png',
  avatars: 'assets/vx_chara03_d.png',
  plants: 'assets/plants2mp1.png',
  decorations: 'assets/tileb.png',
};

let canvas = document.getElementById('canvas');
let hud = document.getElementById('hud');
let ctx = canvas.getContext('2d');
let map;
let things = [];

let pos = {
  x: 0,
  y: 0,
  frame: 0,
  type: 'player',
  name: location.search ? location.search.slice(1) : "Player",
  lastDir: {x: 0, y: 1}
};

let ws = new WebSocket(location.href.replace(/^http/,'ws'));
WebSocket.prototype.emit = function(type, json) {
  this.send(JSON.stringify({type, json}));
};

WebSocket.prototype.on = function(type, fn) {
  if(typeof this._callbacks !== 'object')
    this._callbacks = {};

  if(typeof this._callbacks[type] !== 'object')
    this._callbacks[type] = [];

  this._callbacks[type].push(fn);
};

WebSocket.prototype.handleMessage = function(msg) {
  if(typeof this._callbacks !== 'object')
    return;

  try {
    let { json, type } = JSON.parse(msg.data);
    if(typeof type !== 'undefined' &&
        typeof json !== 'undefined' &&
        typeof this._callbacks[type] === 'object') {
      try {
        this._callbacks[type].forEach(fn => fn(json));
      } catch (e) {
        console.error(e);
      }
    }
  } catch (e) {
    console.warn('Unexpected Non-JSON Message', msg.data, '\n', e);
  }
};

WebSocket.prototype.isOpen = function() {
  return this.readyState == WebSocket.OPEN;
};

ws.onmessage = ws.handleMessage.bind(ws);
ws.onopen = () => {
  ws.emit('name', {name: pos.name});
};

let players = {};

ws.on('transform', json => {
  players[json.id].goalX = json.pos.x;
  players[json.id].goalY = json.pos.y;
  players[json.id].vel = json.vel;
  players[json.id].lastDir = json.lastDir;
});

ws.on('name', json => {
  players[json.id].name = json.name;
});

ws.on('connection', json => {
  console.log(json);
  let p = players[json.id] = {
    x: json.pos.x,
    goalX: json.pos.x,
    y: json.pos.y,
    goalY: json.pos.y,
    name: json.name,
    vel: json.vel,
    lastDir: json.lastDir,
    type: 'player',
    frame: 0,
  };
  things.push(p);
});

ws.on('disconnection', json => {
  let index = things.indexOf(players[json.id]);

  if(index >= -1)
    things.splice(index, 1);

  delete players[json.id];
});

function loadGame() {      
  let num = Object.keys(assets).length;
  let loadingDiv = document.createElement('div');
  hud.appendChild(loadingDiv);
  let header = document.createElement('h2');
  header.innerHTML = "Loading Assets: ";
  loadingDiv.appendChild(header);

  return new Promise(resolve => {
    Object.keys(assets).forEach(key => {
      let img = new Image();
      let elem = document.createElement("div");
      img.src = assets[key];
      elem.innerHTML = img.src;
      loadingDiv.appendChild(elem);
      img.onload = () => {
        loadingDiv.removeChild(elem);
        if(!--num) {
          hud.removeChild(loadingDiv);
          resolve();
        }
      };
      assets[key] = img;
    });
  });
}
const mapSize = 100;
function genMap() {
  let map = document.createElement('canvas');
  let ctx = map.getContext('2d');
  ctx.canvas.width = map.style.width = 32 * mapSize;
  ctx.canvas.height = map.style.height = 32 * mapSize;
  let tiles = [0, 0, 0, 4, 6, 48];
  let sample = () => tiles[Math.floor(Math.random() * tiles.length)];
  for(let i = 0; i < mapSize; i++)
    for(let j = 0; j < mapSize; j++) {
      drawTile(ctx, assets.tileset, sample(), 32, 32, i * 32, j * 32);
      if(Math.random() < 0.05) {
        things.push({
          type: 'decoration',
          tileset: assets.decorations,
          tile: Math.random() < 0.5 ? 50 : 53,
          width: 32,
          height: 64,
          x: (i + 0.5) / mapSize,
          xOff: 0,
          y: (j + 0.5) / mapSize,
          yOff: 4,
        });
      }
    }
  return map;
}

function resizeContext() {
  return {
    width: ctx.canvas.width = canvas.clientWidth,
    height: ctx.canvas.height = canvas.clientHeight,
  };
}

function drawTile(ctx, tileset, tile, width, height, x, y) {
  ctx.drawImage(
    tileset,
    (tile * width) % (tileset.width) + 1,
    Math.floor(tile / (tileset.width / width)) * height % tileset.height + 1,
    width - 2, height - 2,
    x, y,
    width, height);
  // ctx.textBaseline = "top";
  // ctx.fillText(tile, x, y);
};

function drawCharacter(ctx, tileset, character, frame, direction, x, y) {
  let charWidth = 32;
  let charHeight = 48;
  let dirMap = {
    0: 0, 1: 1, 2: 2, 3: 3,
    'down': 0, 'left': 1, 'right': 2, 'up': 3,
    'south': 0, 'west': 1, 'east': 2, 'north': 3,
  }
  frame = frame % 2 == 0 ? 1 : (frame - 1) % 4;
  let i = character * charWidth + tileset.width * dirMap[direction] / charWidth + frame;
  drawTile(ctx, tileset, i, charWidth, charHeight, x - charWidth/2, y - charHeight);
}

let keys = {};

window.addEventListener('keydown', event => {
  keys[event.keyCode] = true;
  keys[event.code] = true;
});

window.addEventListener('keyup', event => {
  keys[event.keyCode] = false;
  keys[event.code] = false;
});

let previewSize = 600;

let root2over2 = 0.70710678118; // sqrt(2)/2
function vecToDir(dir, deg) {
  let theta = Math.atan2(dir.y, dir.x) + deg;
  let cos = Math.round(Math.cos(theta)*1000),
      sin = Math.round(Math.sin(theta)*1000);
  if(Math.abs(cos) >= Math.abs(sin))
    return cos < 0 ? 1 : 2;
  return sin < 0 ? 3 : 0;
}

let now = Date.now();
let deg = Math.PI / 4;
things.push(pos);
let tilt = 0.5;
let offset = {x: 0, y: 0};

function renderGame() {
  requestAnimationFrame(renderGame);
  // console.time('Frame');

  // console.time('Resize');
  let { width, height } = resizeContext();
  // console.timeEnd('Resize');        
  let time = Date.now();
  let delta = (time - now) / 1000;
  now = time;

  // console.time('Movement');        
  let dir = {x: 0, y: 0};
  if(keys.KeyW)
    dir.y -= 1;
  if(keys.KeyS)
    dir.y += 1;
  if(keys.KeyA)
    dir.x -= 1;
  if(keys.KeyD)
    dir.x += 1;
  if(keys.KeyZ)
    tilt -= 2 * delta;
  if(keys.KeyX)
    tilt += 2 * delta;
  tilt = Math.min(Math.max(tilt, 0.4), 0.6);

  if(Math.hypot(dir.x, dir.y) > 0) {
    let theta = Math.atan2(dir.y, dir.x);
    pos.lastDir = {
      x: Math.cos(theta - deg),
      y: Math.sin(theta - deg),
    };
    let speed = keys.ShiftLeft ? 800 : 200;
    pos.x += pos.lastDir.x * speed * delta;
    pos.y += pos.lastDir.y * speed * delta;
    ws.emit('transform', {
      pos: {
        x: pos.x,
        y: pos.y,
      },
      vel: {
        x: pos.lastDir.x * speed,
        y: pos.lastDir.y * speed,
      },
      lastDir: pos.lastDir,
    });
    offset.x += Math.cos(theta) * speed * delta;
    offset.y += Math.sin(theta) * tilt * speed * delta;
    pos.frame += speed / 20 * delta;
  } else {
    if(pos.frame > 0) {
      ws.emit('transform', {
        pos: {
          x: pos.x,
          y: pos.y,
        },
        vel: {x: 0, y: 0},
        lastDir: pos.lastDir,
      });
    }
    pos.frame = 0;
  }

  for(let id in players) {
    let p = players[id];
    p.x += (p.goalX - p.x) * delta * 10;
    p.y += (p.goalY - p.y) * delta * 10;
    if(Math.hypot(p.vel.x, p.vel.y)) {
      p.frame += Math.hypot(p.vel.x, p.vel.y) / 20 * delta;
    } else {
      p.frame = 0;
    }
  }

  offset.x -= offset.x * delta * 4;
  offset.y -= offset.y * delta * 4;

  let oldDeg = deg;
  if(keys.KeyQ) 
    deg += delta * Math.PI / 2;
  if(keys.KeyE)
    deg -= delta * Math.PI / 2;
  // console.timeEnd('Movement');        

  // if(oldDeg != deg || Math.hypot(dir.x, dir.y) > 0) {
  //   // console.time('Sort');
  //   // console.timeEnd('Sort');
  // }

  // for(let i = 0; i < 12 * 16; i++)
  //   drawTile(ctx, assets.tileset, i, 32, i % 16 * 40, Math.floor(i / 16) * 40);
  // console.time('Background');
  ctx.save();
  ctx.translate(width/2 + offset.x, height/2 + offset.y);
  ctx.save();
  ctx.scale(1, tilt);
  ctx.rotate(deg);
  let halfPreview = previewSize/2;
  ctx.fillRect(-halfPreview-2, -halfPreview-2, previewSize+4, previewSize+4);
  ctx.drawImage(map,
    pos.x-halfPreview, pos.y-halfPreview,
    previewSize, previewSize,
    -halfPreview, -halfPreview,
    previewSize, previewSize);
  ctx.restore();
  // console.timeEnd('Background');

  // console.time('Things');
  ctx.save();
  things.map(thing => {
    let y = thing.y * map.height - pos.y;
    let x = thing.x * map.width - pos.x;
    if(thing.type === 'player') {
      x = thing.x - pos.x;
      y = thing.y - pos.y;
    }
    thing.order = Math.sin(Math.atan2(y, x) + deg) * Math.hypot(x, y);
    return thing;
  }).sort((a, b) =>
    a.order - b.order
  ).forEach(thing => {
    let {x, y, tile, tileset} = thing;
    if(thing.type === 'player') {
      x = thing.x - pos.x;
      y = thing.y - pos.y;
    } else {
      x = x * map.width - pos.x;
      y = y * map.height - pos.y;
    }
    let hypot = Math.hypot(x, y);
    let theta = Math.atan2(y, x) + deg;
    if((Math.abs(x) > previewSize/2 ||
        Math.abs(y) > previewSize/2))
      return;

    const fadeRange = 10;
    if(Math.abs(x) > previewSize/2 - fadeRange ||
        Math.abs(y) > previewSize/2 - fadeRange) {
      ctx.globalAlpha = Math.min(
        Math.abs(previewSize/2 - Math.abs(x)) / fadeRange,
        Math.abs(previewSize/2 - Math.abs(y)) / fadeRange);
    } else {
      ctx.globalAlpha = 1;
    }
    // x -= pos.x / map.width;
    // y -= pos.y / map.height;
    if(thing.type === 'player') {
      let x = Math.cos(theta) * hypot;
      let y = Math.sin(theta) * hypot * tilt;
      drawCharacter(ctx,
        assets.avatars,
        0,
        Math.floor(thing.frame),
        vecToDir(thing.lastDir, deg),
        x, y);

      ctx.font = 'small-caps bold 13px helvetica';
      // I like Palatino, helvetica, and monospace
      ctx.lineWidth = 2;
      //ctx.strokeStyle = '#fff';
      //ctx.fillStyle = '#000';
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'center';

      ctx.strokeText(thing.name, x, y - 48);
      ctx.fillText(thing.name, x, y - 48);
    } else {
      drawTile(ctx, tileset, tile,
        thing.width, thing.height,
        Math.cos(theta) * hypot - thing.width/2 + thing.xOff,
        Math.sin(theta) * hypot * tilt - thing.height + thing.yOff);
    }
  });
  ctx.restore();
  ctx.restore();
  // console.timeEnd('Things');

  // drawTile(ctx, assets.items, Math.floor(Date.now()/8) % (assets.items.width * assets.items.height / 24 / 24), 24, 24, 50, 50);

  // console.timeEnd('Frame');
}

window.addEventListener('load', () => {
  loadGame().then(() => {
    map = genMap();
  }).then(renderGame);
})