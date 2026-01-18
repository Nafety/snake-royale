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
    this.walls = [];               // murs actifs
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
    const now = Date.now();

    // 🔹 Supprimer les murs expirés
    if (this.walls) {
      this.walls = this.walls.filter(w => !w.expiresAt || w.expiresAt > now);
    } else {
      this.walls = [];
    }

    // 🔹 Déplacement des serpents + ramassage de pomme
    for (const id in this.snakes) {
      const snake = this.snakes[id];

      // Vérifier si le serpent est gelé
      if (!snake.isFrozen || !snake.isFrozen()) {
        snake.move(config);
      }

      // Ramasser la pomme
      if (collide(snake.head(), this.apple.pos, config.game.gridSize)) {
        snake.grow();
        this.apple.respawn(config);
      }
    }

    // 🔹 Vérifier collisions (corps, autres serpents, murs)
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

      // 💥 collision avec les murs
      for (const wall of this.walls) {
        if (collide(headA, wall, config.game.gridSize)) {
          A.reset(config);
          this.resetThisFrame.add(ids[i]);
        }
      }
    }
  }

  // ================================
  // GESTION DES COMPÉTENCES
  // ================================
  useSkill(playerId, skill) {
    const snake = this.snakes[playerId];
    if (!snake) return;

    switch (skill) {
      case 'dash':
        snake.tryDash(this.config);
        break;
      case 'freeze':
        snake.applyFreeze(this.config);
        break;
      case 'wall':
        const newWalls = snake.tryWall(this.config);
        if (newWalls) {
          this.walls.push(...newWalls);
        }
        break;
    }
  }

  getState() {
    const snakesState = {};
    for (const id in this.snakes) {
      snakesState[id] = this.snakes[id].getPublicState();
    }

    return {
      snakes: snakesState,
      apple: this.apple.pos,
      walls: this.walls
    };
  }
}

module.exports = GameRoom;
