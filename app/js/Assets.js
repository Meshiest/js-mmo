let assets = {
  // items: 'assets/bigset.png',
  fluidset: 'img/tilea1.png',
  groundedges: 'img/tilea2.png',
  ground: 'img/tilea5.png',
  avatars: 'img/vx_chara03_d.png',
  plants: 'img/plants2mp1.png',
  decorations: 'img/tileb.png',
};


let loaded = false;

module.exports = {
  getAssets() {
    return assets;
  },
  isLoaded() {
    return loaded;
  },
  load() {
    let num = Object.keys(assets).length;

    return new Promise(resolve => {
      Object.keys(assets).forEach(key => {
        let img = new Image();
        img.src = assets[key];
        img.onload = () => {
          if(!--num) {
            loaded = true;
            resolve();
          }
        };
        assets[key] = img;
      });
    });
  }
};