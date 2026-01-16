const config = require('../config');

function collide(a, b) {
  return (
    Math.abs(a.x - b.x) < config.game.gridSize &&
    Math.abs(a.y - b.y) < config.game.gridSize
  );
}

module.exports = { collide };
