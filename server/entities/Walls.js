class Walls {
  constructor(config) {
    this.config = config;
    this.borders = [];

    if (!config.game.isTeleportationAllowed) {
      this._createBorderWalls();
    }
  }

  /* =========================
     INIT MAP WALLS
  ========================= */
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

  /* =========================
     UPDATE
  ========================= */
  update(now = Date.now()) {
    // Les murs de skill ne sont plus gérés ici, rien à faire
  }

  getState() {
    return { borders: this.borders };
  }
}

module.exports = Walls;
