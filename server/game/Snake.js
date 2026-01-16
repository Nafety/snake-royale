class Snake {
  constructor(config) {
    this.body = [ { ...config.game.snake.startPos } ];
    this.length = config.game.snake.startLength;
    this.dir = { x: 1, y: 0 };
  }

  setDirection(config, dir) {
    // Empêche l’inversion immédiate si tu veux (optionnel)
    if (this.body.length > 1) {
      const head = this.head();
      const neck = this.body[this.body.length - 2];
      if (dir.x === (head.x - neck.x) / config.game.gridSize &&
          dir.y === (head.y - neck.y) / config.game.gridSize) {
        return; // ignore inversion
      }
    }
    this.dir = dir;
  }

  move(config) {
    const head = this.head();
    let nextX = head.x + this.dir.x * config.game.gridSize;
    let nextY = head.y + this.dir.y * config.game.gridSize;

    // === Wrapping ===
    const maxX = config.game.map.width * config.game.gridSize;
    const maxY = config.game.map.height * config.game.gridSize;

    if (nextX >= maxX) nextX = 0;
    if (nextX < 0) nextX = maxX - config.game.gridSize;

    if (nextY >= maxY) nextY = 0;
    if (nextY < 0) nextY = maxY - config.game.gridSize;

    const next = { x: nextX, y: nextY };
    this.body.push(next);

    while (this.body.length > this.length) this.body.shift();
  }

  grow() {
    this.length++;
  }

  reset(config) {
    this.body = [ { ...config.game.snake.startPos } ];
    this.length = config.game.snake.startLength;
    this.dir = { x: 1, y: 0 };
  }

  head() {
    return this.body[this.body.length - 1];
  }
}

module.exports = Snake;
