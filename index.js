const express = require('express');
const WebSocket = require('ws');
const http = require('http');

let app = express();
let server = http.Server(app);
let wss = new WebSocket.Server({server: server});

const PORT = 3000;

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html');
});

WebSocket.prototype.$emit = function(type, json) {
  this.send(JSON.stringify({type, json}));
};

WebSocket.prototype.$broadcast = function(type, json) {
  wss.clients.forEach((i, c) => {
    if(c !== this) {
      c.$emit(type, json);
    }
  });
};

let players = {};
let ids = 0;

wss.on('connection', ws => {
  let id = ids++;
  let player = players[id] = {
    pos: {x: 0, y: 0},
    vel: {x: 0, y: 0},
    name: 'Player',
    lastDir: {x: 0, y: 1},
  };
  ws.player = player;
  ws.id = id;

  ws.$broadcast('connection', {
    id,
    pos: player.pos,
    vel: player.vel,
    name: player.name,
    lastDir: player.lastDir,
  });
  wss.clients.forEach((i, e) => {
    if(ws !== e) {
      let p = players[e.id];
      ws.$emit('connection', {
        id: e.id,
        name: p.name,
        pos: p.pos,
        vel: p.vel,
        lastDir: p.lastDir,
      });
    }
  });

  ws.on('close', () => {
    ws.$broadcast('disconnection', {id});
    delete players[id];
  });

  ws.on('message', msg => {
    try {
      let { json, type } = JSON.parse(msg);

      switch(type) {
      case 'transform':
        let { pos, vel, lastDir } = json;
        json.id = id;
        player.pos = pos;
        player.vel = vel;
        player.lastDir = lastDir;
        ws.$broadcast('transform', json);
        break;

      case 'name':
        json.id = id;
        player.name = json.name;
        ws.$broadcast('name', json);
        break;
      }
    } catch (e) {
      // Invalid message
    }
  });
});

server.listen(process.env.PORT || PORT, () => {
  console.log('Listening on *:', PORT);
});
