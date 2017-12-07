let keys = {};
let readingKeys = true;

window.addEventListener('keydown', event => {
  if(!readingKeys)
    return;

  keys[event.keyCode] = true;
  keys[event.code] = true;
});


window.addEventListener('keyup', event => {
  if(!readingKeys)
    return;

  keys[event.keyCode] = false;
  keys[event.code] = false;
});

window.addEventListener('blur', () => {
  for(let key in keys)
    delete keys[key];
});

export default {
  keys,
  setReadingKeys(bool) {
    readingKeys = !!bool;
  },
  disableKeys() {
    readingKeys = false;
  },
  enableKeys() {
    readingKeys = true;
  },
};

module.exports = {
  keys
};