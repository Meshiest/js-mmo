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
  drawTile, drawAvatar, vecToDir
};