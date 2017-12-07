function drawTile(ctx, tileset, tile, width, height, x, y) {
  ctx.drawImage(
    tileset,
    (tile * width) % (tileset.width),
    Math.floor(tile / (tileset.width / width)) * height % tileset.height,
    width, height,
    x, y,
    width, height);
}

const tileSize = 32;
const partSize = 16;
/*
  012
  7 3
  654
*/

let autoTileMap = [
  [0, 1, 4, 5], [10, 11, 22, 23], [0, 1, 4, 5],
  [10, 11, 22, 23], [8, 11, 12, 15], [10, 11, 6, 15],
  [8, 11, 12, 15], [10, 11, 14, 15], [0, 1, 4, 5],
  [10, 11, 22, 23], [0, 1, 4, 5], [10, 11, 22, 23],
  [8, 11, 12, 15], [10, 11, 6, 15], [8, 11, 12, 15],
  [10, 11, 14, 15], [8, 9, 20, 21], [10, 9, 22, 21],
  [8, 9, 20, 21], [10, 9, 22, 21], [8, 9, 12, 7],
  [10, 9, 6, 7], [8, 9, 12, 7], [10, 9, 14, 7],
  [8, 9, 20, 21], [10, 9, 22, 21], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 12, 13], [10, 9, 6, 13],
  [8, 9, 12, 13], [10, 9, 14, 13], [0, 1, 4, 5],
  [10, 11, 22, 23], [0, 1, 4, 5], [10, 11, 22, 23],
  [8, 11, 12, 15], [10, 11, 6, 15], [8, 11, 12, 15],
  [10, 11, 14, 15], [0, 1, 4, 5], [10, 11, 22, 23],
  [0, 1, 4, 5], [10, 11, 22, 23], [8, 11, 12, 15],
  [10, 11, 6, 15], [8, 11, 12, 15], [10, 11, 14, 15],
  [8, 9, 20, 21], [10, 9, 22, 21], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 12, 7], [10, 9, 6, 7],
  [8, 9, 12, 7], [10, 9, 14, 7], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 20, 21], [10, 9, 22, 21],
  [8, 9, 12, 13], [10, 9, 6, 13], [8, 9, 12, 13],
  [10, 9, 14, 13], [16, 19, 20, 23], [2, 19, 22, 23],
  [16, 19, 20, 23], [2, 19, 22, 23], [16, 19, 12, 15],
  [2, 19, 6, 15], [16, 19, 12, 15], [2, 19, 14, 15],
  [16, 19, 20, 23], [2, 19, 22, 23], [16, 19, 20, 23],
  [2, 19, 22, 23], [16, 19, 12, 15], [2, 19, 6, 15],
  [16, 19, 12, 15], [2, 19, 14, 15], [16, 3, 20, 21],
  [2, 3, 22, 21], [16, 3, 20, 21], [2, 3, 22, 21],
  [16, 3, 12, 7], [2, 3, 6, 7], [16, 3, 12, 7],
  [2, 3, 14, 7], [16, 3, 20, 21], [2, 3, 22, 21],
  [16, 3, 20, 21], [2, 3, 22, 21], [16, 3, 12, 13],
  [2, 3, 6, 13], [16, 3, 12, 13], [2, 3, 14, 13],
  [16, 19, 20, 23], [2, 19, 22, 23], [16, 19, 20, 23],
  [2, 19, 22, 23], [16, 19, 12, 15], [2, 19, 6, 15],
  [16, 19, 12, 15], [2, 19, 14, 15], [16, 19, 20, 23],
  [2, 19, 22, 23], [16, 19, 20, 23], [2, 19, 22, 23],
  [16, 19, 12, 15], [2, 19, 6, 15], [16, 19, 12, 15],
  [2, 19, 14, 15], [16, 17, 20, 21], [2, 17, 22, 21],
  [16, 17, 20, 21], [2, 17, 22, 21], [16, 17, 12, 7],
  [2, 17, 6, 7], [16, 17, 12, 7], [2, 17, 14, 7],
  [16, 17, 20, 21], [2, 17, 22, 21], [16, 17, 20, 21],
  [2, 17, 22, 21], [16, 17, 12, 13], [2, 17, 6, 13],
  [16, 17, 12, 13], [2, 17, 14, 13], [0, 1, 4, 5],
  [10, 11, 22, 23], [0, 1, 4, 5], [10, 11, 22, 23],
  [8, 11, 12, 15], [10, 11, 6, 15], [8, 11, 12, 15],
  [10, 11, 14, 15], [0, 1, 4, 5], [10, 11, 22, 23],
  [0, 1, 4, 5], [10, 11, 22, 23], [8, 11, 12, 15],
  [10, 11, 6, 15], [8, 11, 12, 15], [10, 11, 14, 15],
  [8, 9, 20, 21], [10, 9, 22, 21], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 12, 7], [10, 9, 6, 7],
  [8, 9, 12, 7], [10, 9, 14, 7], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 20, 21], [10, 9, 22, 21],
  [8, 9, 12, 13], [10, 9, 6, 13], [8, 9, 12, 13],
  [10, 9, 14, 13], [0, 1, 4, 5], [10, 11, 22, 23],
  [0, 1, 4, 5], [10, 11, 22, 23], [8, 11, 12, 15],
  [10, 11, 6, 15], [8, 11, 12, 15], [10, 11, 14, 15],
  [0, 1, 4, 5], [10, 11, 22, 23], [0, 1, 4, 5],
  [10, 11, 22, 23], [8, 11, 12, 15], [10, 11, 6, 15],
  [8, 11, 12, 15], [10, 11, 14, 15], [8, 9, 20, 21],
  [10, 9, 22, 21], [8, 9, 20, 21], [10, 9, 22, 21],
  [8, 9, 12, 7], [10, 9, 6, 7], [8, 9, 12, 7],
  [10, 9, 14, 7], [8, 9, 20, 21], [10, 9, 22, 21],
  [8, 9, 20, 21], [10, 9, 22, 21], [8, 9, 12, 13],
  [10, 9, 6, 13], [8, 9, 12, 13], [10, 9, 14, 13],
  [16, 19, 20, 23], [18, 19, 22, 23], [16, 19, 20, 23],
  [18, 19, 22, 23], [16, 19, 12, 15], [18, 19, 6, 15],
  [16, 19, 12, 15], [18, 19, 14, 15], [16, 19, 20, 23],
  [18, 19, 22, 23], [16, 19, 20, 23], [18, 19, 22, 23],
  [16, 19, 12, 15], [18, 19, 6, 15], [16, 19, 12, 15],
  [18, 19, 14, 15], [16, 3, 20, 21], [18, 3, 22, 21],
  [16, 3, 20, 21], [18, 3, 22, 21], [16, 3, 12, 7],
  [18, 3, 6, 7], [16, 3, 12, 7], [18, 3, 14, 7],
  [16, 3, 20, 21], [18, 3, 22, 21], [16, 3, 20, 21],
  [18, 3, 22, 21], [16, 3, 12, 13], [18, 3, 6, 13],
  [16, 3, 12, 13], [18, 3, 14, 13], [16, 19, 20, 23],
  [18, 19, 22, 23], [16, 19, 20, 23], [18, 19, 22, 23],
  [16, 19, 12, 15], [18, 19, 6, 15], [16, 19, 12, 15],
  [18, 19, 14, 15], [16, 19, 20, 23], [18, 19, 22, 23],
  [16, 19, 20, 23], [18, 19, 22, 23], [16, 19, 12, 15],
  [18, 19, 6, 15], [16, 19, 12, 15], [18, 19, 14, 15],
  [16, 17, 20, 21], [18, 17, 22, 21], [16, 17, 20, 21],
  [18, 17, 22, 21], [16, 17, 12, 7], [18, 17, 6, 7],
  [16, 17, 12, 7], [18, 17, 14, 7], [16, 17, 20, 21],
  [18, 17, 22, 21], [16, 17, 20, 21], [18, 17, 22, 21],
  [16, 17, 12, 13], [18, 17, 6, 13], [16, 17, 12, 13],
  [18, 17, 14, 13],
];

function autoTile(ctx, tileset, index, edge, x, y) {
  let baseX = (index * tileSize) % (tileset.width);
  let baseY = Math.floor(index / (tileset.width / tileSize)) * tileSize % tileset.height;

  for(let i = 0; i < 4; i++) {
    let j = Math.floor(i / 2);
    let pos = autoTileMap[edge][i];
    ctx.drawImage(
      tileset,
      baseX + (pos % 4) * partSize,
      baseY + Math.floor(pos / 4) * partSize,
      16, 16,
      x + (i%2) * partSize, y + j * partSize,
      partSize, partSize);
  }
}

const charWidth = 32;
const charHeight = 48;

function drawAvatar(ctx, tileset, avatar, frame, direction, x, y) {
  let dirMap = {
    0: 0, 1: 1, 2: 2, 3: 3,
    down: 0, left: 1, right: 2, up: 3,
    south: 0, west: 1, east: 2, north: 3,
  };
  frame = frame % 2 === 0 ? 1 : (frame - 1) % 4;
  let i = avatar + tileset.width * dirMap[direction] / charWidth + frame;
  drawTile(ctx, tileset, i, charWidth, charHeight, x - charWidth/2, y - charHeight);
}

function vecToDir(dir, deg) {
  let theta = Math.atan2(dir.y, dir.x) + deg;

  // Low precision prevents floating point rounding errors
  let cos = Math.round(Math.cos(theta) * 1000),
    sin = Math.round(Math.sin(theta) * 1000);

  if(Math.abs(cos) >= Math.abs(sin))
    return cos < 0 ? 1 : 2;
  return sin < 0 ? 3 : 0;
}

module.exports = {
  drawTile, autoTile, drawAvatar, vecToDir
};