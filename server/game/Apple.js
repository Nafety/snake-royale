// server/Apple.js
class Apple {
  constructor(config) {
    this.pos = this.randomPos(config);
  }

  respawn(config) {
    this.pos = this.randomPos(config);
  }

  randomPos(config) {
    // Positions en coordonnées GRILLE au lieu de pixels
    return {
      x: Math.floor(Math.random() * config.game.map.width),
      y: Math.floor(Math.random() * config.game.map.height)
    };
  }
}

module.exports = Apple;
