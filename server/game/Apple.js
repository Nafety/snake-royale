// server/Apple.js
class Apple {
  constructor(config) {
    this.pos = this.randomPos(config);
  }

  respawn(config) {
    this.pos = this.randomPos(config);
  }

  randomPos(config) {
    return {
      x: Math.floor(Math.random() * config.game.map.width) * config.game.gridSize,
      y: Math.floor(Math.random() * config.game.map.height) * config.game.gridSize
    };
  }
}

module.exports = Apple;
