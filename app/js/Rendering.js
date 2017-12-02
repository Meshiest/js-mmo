function drawTile(ctx, tileset, tile, width, height, x, y) {
  ctx.drawImage(
    tileset,
    (tile * width) % (tileset.width),
    Math.floor(tile / (tileset.width / width)) * height % tileset.height,
    width, height,
    x, y,
    width, height);
}

const charWidth = 32;
const charHeight = 48;

function drawCharacter(ctx, tileset, character, frame, direction, x, y) {
  let dirMap = {
    0: 0, 1: 1, 2: 2, 3: 3,
    down: 0, left: 1, right: 2, up: 3,
    south: 0, west: 1, east: 2, north: 3,
  };
  frame = frame % 2 === 0 ? 1 : (frame - 1) % 4;
  let i = character + tileset.width * dirMap[direction] / charWidth + frame;
  drawTile(ctx, tileset, i, charWidth, charHeight, x - charWidth/2, y - charHeight);
}

module.exports = {
  drawTile, drawCharacter
};