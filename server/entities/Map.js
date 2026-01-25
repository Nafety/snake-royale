// server/entities/Map.js
const Walls = require("./Walls");

class Map {
  constructor(config) {
    this.config = config;

    this.walls = new Walls(config);
    this.obstacles = [];
  }

  getState() {
    return {
      borders: this.walls.getState(),
      obstacles: this.obstacles.map(o => o.pos),
    };
  }

  update() {
    // plus tard : obstacles dynamiques
  }
}

module.exports = Map;
