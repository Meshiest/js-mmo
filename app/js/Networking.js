import { createWebSocket } from './util/WebSocket.js';
import world from './World.js';
import Player from './Player.js';

let clients = {};

class Client {
  constructor(id, name, pos, vel, dir) {
    this.id = id;
    this.name = name;
    this.player = new Player(name, pos, vel, dir);
    this.player.client = this;
  }
}

let ws;

module.exports = {
  getWebSocket() {
    return ws;
  },
  connect() {
    return new Promise(resolve => {
      ws = createWebSocket();
      window.addEventListener('unload', () => ws.close());
      ws.onopen = () => {
        ws.emit('name', {name: world.controlEntity.name});
        resolve(ws);
      };

      // Assign player goal position
      ws.on('transform', ({id, pos, vel, dir}) => {
        clients[id].player.goal = pos;
        clients[id].player.vel = vel;
        clients[id].player.dir = dir;
      });

      // Force player position
      ws.on('transport', ({id, pos, vel, dir}) => {
        clients[id].player.goal = pos;
        clients[id].player.pos = pos;
        clients[id].player.vel = vel;
        clients[id].player.dir = dir;
      });

      // Update player name
      ws.on('name', ({id, name}) => {
        clients[id].player.name = name;
      });

      ws.on('connection', ({id, name, pos, vel, dir}) => {
        clients[id] = new Client(id, name, pos, vel, dir);
        world.entities.push(clients[id].player);
      });

      ws.on('disconnection', ({id}) => {
        let index = world.entities.indexOf(clients[id].player);
        if(index >= -1)
          world.entities.splice(index, 1);

        delete clients[id];
      });
    });
  }
};
