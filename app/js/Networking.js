import { createWebSocket } from './util/WebSocket.js';
import world from './World.js';
import Player from './Player.js';
console.log('foo');

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
      console.log('Created ws');
      ws.onopen = () => {
        ws.emit('name', {name: world.controlEntity.name});
        resolve(ws);
      };

      ws.on('transform', ({id, pos, vel, dir}) => {
        clients[id].player.goal = pos;
        clients[id].player.vel = vel;
        clients[id].player.dir = dir;
      });

      ws.on('name', ({id, name}) => {
        clients[id].player.name = name;
      });

      ws.on('connection', ({id, name, pos, vel, dir}) => {
        clients[id] = new Client(id, name, pos, vel, dir);
        world.entities.push(clients[id].player);
      });

      ws.on('disconnection', ({id}) => {
        let index = world.entities.indexOf(clients[id]);

        if(index >= -1)
          world.entities.splice(index, 1);

        delete clients[id];
      });
    });
  }
};
