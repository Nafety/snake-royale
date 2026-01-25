// server/entities/Walls.js
class Walls {
  constructor(config) {
    this.config = config;
    this.borders = [];

    this._buildFromConfig();
  }

  /* =========================
     BUILD FROM CONFIG
  ========================= */
  _buildFromConfig() {
    const map = this.config.game.map;

    if (map.type === "borders") {
      this._createBorderWalls();
    }

    if (map.type === "custom" && Array.isArray(map.walls)) {
      this.borders.push(...map.walls);
    }

    if (map.type === "ascii" && Array.isArray(map.ascii)) {
      this._parseAscii(map.ascii);
    }
  }

  _createBorderWalls() {
    const { width, height } = this.config.game.map;

    for (let x = 0; x < width; x++) {
      this.borders.push({ x, y: 0 });
      this.borders.push({ x, y: height - 1 });
    }
    for (let y = 1; y < height - 1; y++) {
      this.borders.push({ x: 0, y });
      this.borders.push({ x: width - 1, y });
    }
  }

  _parseAscii(ascii) {
    ascii.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === "#") {
          this.borders.push({ x, y });
        }
      });
    });
  }

  /* =========================
     STATE
  ========================= */
  getState() {
    return this.borders;
  }
}

module.exports = Walls;
