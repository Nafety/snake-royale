// server/GameRoom.js
const Snake = require('./Snake');
const Apple = require('./Apple');
const { collide } = require('./collisions');
const config = require('../config');

class GameRoom {
  constructor() {
    this.snakes = {};      // { socketId: Snake }
    this.apple = new Apple(config);
  }

  addPlayer(socketId) {
    this.snakes[socketId] = new Snake(config);
  }

  removePlayer(socketId) {
    delete this.snakes[socketId];
  }

  setInput(socketId, dir) {
    if (this.snakes[socketId]) {
      this.snakes[socketId].setDirection(config, dir);
    }
  }

  update() {
    // Déplacer les snakes et vérifier collisions avec la pomme
    for (const id in this.snakes) {
      const snake = this.snakes[id];
      snake.move(config);

      if (collide(snake.head(), this.apple.pos, config.game.gridSize)) {
        snake.grow();
        this.apple.respawn(config);
      }
    }

    // Vérifier collisions entre snakes
    this.checkCollisions();
  }

  checkCollisions() {
    const ids = Object.keys(this.snakes);

    for (let i = 0; i < ids.length; i++) {
      const A = this.snakes[ids[i]];
      const headA = A.head();

      // Collision avec son propre corps
      for (let seg of A.body.slice(0, -1)) {
        if (collide(headA, seg, config.game.gridSize)) {
          A.reset(config);
        }
      }

      // Collision avec les autres snakes
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;
        const B = this.snakes[ids[j]];
        for (let seg of B.body) {
          if (collide(headA, seg, config.game.gridSize)) {
            A.reset(config);
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
