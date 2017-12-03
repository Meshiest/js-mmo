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
  return this.readyState === WebSocket.OPEN;
};

module.exports = {
  createWebSocket() {
    let ws = new WebSocket(location.href.replace(/^http/,'ws'));
    ws.onmessage = ws.handleMessage.bind(ws);
    return ws;
  }
};