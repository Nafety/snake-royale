class Snake {
  constructor(config) {
    this.body = [ { ...config.game.snake.startPos } ];
    this.length = config.game.snake.startLength;
    this.dir = { x: 0, y: 0 };
  }

  setDirection(dir) {
    // Empêche l'inversion immédiate (180 degrés)
    if (this.dir.x + dir.x === 0 && this.dir.y + dir.y === 0) {
      return; // ignore inversion
    }
    this.dir = dir;
  }

  move(config) {
    const head = this.head();
    let nextX = head.x + this.dir.x;    
    let nextY = head.y + this.dir.y;    

    // === Wrapping ===
    const maxX = config.game.map.width;
    const maxY = config.game.map.height;

    if (nextX >= maxX) nextX = 0;
    if (nextX < 0) nextX = maxX - 1;

    if (nextY >= maxY) nextY = 0;
    if (nextY < 0) nextY = maxY - 1;

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
    this.dir = { x: 0, y: 0 };
  }

  head() {
    return this.body[this.body.length - 1];
  }
}

module.exports = Snake;
