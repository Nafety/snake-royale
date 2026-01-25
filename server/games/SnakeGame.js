// server/SnakeGame.js
const Game = require('./Game');
const Snake = require('../entities/Snake');
const Apple = require('../entities/Apple');
const Map = require('../entities/Map'); // nouvelle Map
const { collide } = require('./collisions');

class SnakeGame extends Game {
  constructor(config, skillsDB) {
    super(config);

    this.skills = skillsDB;
    this.snakes = {};
    this.resetThisFrame = new Set();

    // Au lieu de walls, on instancie une Map
    this.map = new Map(config, skillsDB);

    // Apple reste géré dynamiquement ici
    this.apple = new Apple(config);
  }

  init(gameData) {
    console.log('🐍 SnakeGame init with players:', gameData.players);

    for (const playerId of gameData.players) {
      const loadout = gameData.layouts[playerId] || [];
      const snake = new Snake(this.config, this.skills, loadout);
      this.snakes[playerId] = snake;
    }
  }

  /* ================================
     INPUT
  ================================ */
  setInput(socketId, dir) {
    const snake = this.snakes[socketId];
    if (!snake) return;
    snake.setDirection(dir, this.config);
  }

  /* ================================
     GAME LOOP
  ================================ */
  update() {
    const { config } = this;
    const now = Date.now();

    // déplacer les snakes
    for (const id in this.snakes) {
      const snake = this.snakes[id];
      snake.updateWalls(now); // murs dynamiques des snakes
      if (!snake.isFrozen || !snake.isFrozen()) {
        snake.move(config);
      }
    }

    // collisions
    this.checkCollisions();
  }

  /* ================================
     COLLISIONS
  ================================ */
  checkCollisions() {
    const { config } = this;
    const ids = Object.keys(this.snakes);

    for (let i = 0; i < ids.length; i++) {
      const A = this.snakes[ids[i]];
      const headA = A.head();

      // collision avec son corps
      if (config.game.snake.selfCollision && A.body.length > 1) {
        for (const seg of A.body.slice(0, -1)) {
          if (seg.x === headA.x && seg.y === headA.y) continue;
          if (collide(headA, seg, config.game.gridSize)) {
            console.log(`💥 Player ${ids[i]} collided with self`);
            A.reset(config);
            break;
          }
        }
      }

      // collision avec les autres snakes
      for (let j = 0; j < ids.length; j++) {
        if (i === j) continue;
        const B = this.snakes[ids[j]];
        for (const seg of B.body) {
          if (collide(headA, seg, config.game.gridSize)) {
            console.log(`💥 Player ${ids[i]} collided with player ${ids[j]}`);
            A.reset(config);
          }
        }
      }

      // collision avec les murs de la map
      for (const wall of this.map.walls.borders) {
        if (collide(headA, wall, config.game.gridSize)) {
          console.log(`💥 Player ${ids[i]} collided with a wall`);
          A.reset(config);
        }
      }

      // collision avec les murs des snakes
      for (let j = 0; j < ids.length; j++) {
        const B = this.snakes[ids[j]];
        for (const wall of B.items) {
          if (collide(headA, wall, config.game.gridSize)) {
            console.log(`💥 Player ${ids[i]} collided with wall of ${B.id}`);
            A.reset(config);
          }
        }
      }

      // collision avec la pomme
      if (collide(headA, this.apple.pos, config.game.gridSize)) {
        console.log(`🍎 Player ${ids[i]} ate the apple`);
        A.grow();
        this.apple.respawn(config);
      }
    }
  }

  /* ================================
     SKILLS
  ================================ */
  useSkill(playerId, skill, targetId = null) {
    console.log(`[SNAKE GAME=]🪄 Player ${playerId} attempts to use skill ${skill} on target ${targetId || 'none'}`);
    const snake = this.snakes[playerId];
    if (!snake || !snake.hasSkill(skill)) return;

    let targetSnake = null;
    if (targetId && this.snakes[targetId]) targetSnake = this.snakes[targetId];

    snake.useSkill(skill, targetSnake);
  }

  /* ================================
     ÉTAT PUBLIC
  ================================ */
  getState() {
    const snakesState = {};
    for (const id in this.snakes) {
      snakesState[id] = this.snakes[id].getPublicState();
    }

    return {
      snakes: snakesState,
      apple: this.apple.pos,
      map:this.map.getState(),
    };
  }
}

module.exports = SnakeGame;
