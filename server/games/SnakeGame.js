// server/SnakeGame.js
const Game = require('./Game');
const Snake = require('../entities/Snake');
const Apple = require('../entities/Apple');
const Walls = require('../entities/Walls');
const { collide } = require('./collisions');

class SnakeGame extends Game {
  constructor(config, skillsDB) {
    super(config);

    // Dépendances
    this.skills = skillsDB;

    // État du jeu
    this.snakes = {};
    this.resetThisFrame = new Set();

    // Objets globaux
    this.walls = new Walls(config, this.skills);
    this.apple = new Apple(config);
  }

  /**
   * Initialisation de la partie
   */
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
    // déplacer les serpents
    for (const id in this.snakes) {
      const snake = this.snakes[id];
      snake.updateWalls(now); // supprime les murs expirés
      if (!snake.isFrozen || !snake.isFrozen()) {
        snake.move(config);
      }
    }

    // gérer toutes les collisions
    this.checkCollisions();
  }

  /* ================================
     COLLISIONS (snakes, murs, pomme)
  ================================ */
  checkCollisions() {
    const { config } = this;
    const ids = Object.keys(this.snakes);

    for (let i = 0; i < ids.length; i++) {
      const A = this.snakes[ids[i]];
      const headA = A.head();

      // 💥 collision avec son corps
      if (config.game.snake.selfCollision && A.body.length > 1) {
        const headA = A.head();
        // on ignore les segments qui ont exactement les mêmes coordonnées que la tête
        for (const seg of A.body.slice(0, -1)) {
          if (seg.x === headA.x && seg.y === headA.y) continue; // skip overlap init
          if (collide(headA, seg, config.game.gridSize)) {
            console.log(`💥 Player ${ids[i]} collided with self`);
            A.reset(config);
            break;
          } 
        }
      }


      // 💥 collision avec les autres serpents
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

      // 💥 collision avec les murs
      for (const wall of this.walls.borders) {
        if (collide(headA, wall, config.game.gridSize)) {
          console.log(`💥 Player ${ids[i]} collided with a wall`);
          A.reset(config);
        }
      }

      // 💥 collision avec les murs des snakes
      for (let j = 0; j < ids.length; j++) {
        const B = this.snakes[ids[j]];
        for (const wall of B.items) {
          if (collide(headA, wall, config.game.gridSize)) {
            console.log(`💥 Player ${ids[i]} collided with wall of ${B.id}`);
            A.reset(config);
          }
        }
      }

      // 🍎 collision avec la pomme
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

  // récupérer le snake ciblé si fourni
  let targetSnake = null;
  if (targetId && this.snakes[targetId]) {
    targetSnake = this.snakes[targetId];
  }
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
      walls: this.walls.getState()
    };
  }
}

module.exports = SnakeGame;
