// server/GameRoom.js
const Snake = require('./Snake');
const Apple = require('./Apple');
const { collide } = require('./collisions');

class GameRoom {
  constructor(config) {
    this.config = config;
    this.snakes = {};              // { socketId: Snake }
    this.apple = new Apple(config);
    this.resetThisFrame = new Set(); // Track qui a reset ce frame
  }

  addPlayer(socketId) {
    this.snakes[socketId] = new Snake(this.config);
  }

  removePlayer(socketId) {
    delete this.snakes[socketId];
  }

  setInput(socketId, dir) {
    const snake = this.snakes[socketId];
    if (!snake) return;

    snake.setDirection(dir, this.config);
  }

  update() {
    const { config } = this;

    // Déplacement + pomme
    for (const id in this.snakes) {
      const snake = this.snakes[id];
      snake.move(config);

      if (collide(snake.head(), this.apple.pos, config.game.gridSize)) {
        snake.grow();
        this.apple.respawn(config);
      }
    }

    this.checkCollisions();
  }

  checkCollisions() {
    const { config } = this;
    const ids = Object.keys(this.snakes);

    for (let i = 0; i < ids.length; i++) {
      const A = this.snakes[ids[i]];
      const headA = A.head();

      // 💥 collision avec son corps
      if (config.game.snake.selfCollision) {
        for (const seg of A.body.slice(0, -1)) {
          if (collide(headA, seg, config.game.gridSize)) {
            A.reset(config);
            this.resetThisFrame.add(ids[i]);
          }
        }
      }

      // 💥 collision avec les autres snakes
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;

        const B = this.snakes[ids[j]];
        for (const seg of B.body) {
          if (collide(headA, seg, config.game.gridSize)) {
            A.reset(config);
            this.resetThisFrame.add(ids[i]);
          }
        }
      }
    }
  }

  getState() {
    return {
      snakes: this.snakes,
      apple: this.apple.pos
    };
  }
}

module.exports = GameRoom;
