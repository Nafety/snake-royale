// server/GameRoom.js
const Snake = require('./Snake');
const Apple = require('./Apple');
const { collide } = require('./collisions');

class GameRoom {
  constructor(config, skillsDB) {
    this.config = config;

    // DB complète des skills (envoyée au client)
    this.skills = skillsDB;

    // { socketId: Snake }
    this.snakes = {};

    this.apple = new Apple(config);
    this.resetThisFrame = new Set();
    this.walls = [];

    // 🔹 Layout sélectionné par joueur
    // { socketId: ['dash', 'freeze'] }
    this.playerLayouts = {};
  }

  // ================================
  // JOUEURS
  // ================================
  addPlayer(socketId, loadout = []) {
    console.log(`Adding player ${socketId} with loadout:`, loadout);
    // Enregistrer le loadout du joueur
    this.setLayout(socketId, loadout);
    console.log(`Player ${socketId} layout set to:`, this.playerLayouts[socketId]);
    // Créer le snake avec ses compétences
    const snake = new Snake(this.config, this.skills, this.playerLayouts[socketId]);
    this.snakes[socketId] = snake;
  }

  removePlayer(socketId) {
    delete this.snakes[socketId];
    delete this.playerLayouts[socketId];
  }

  setInput(socketId, dir) {
    const snake = this.snakes[socketId];
    if (!snake) return;
    snake.setDirection(dir, this.config);
  }

  // ================================
  // LAYOUT / SKILLS
  // ================================
  /**
   * Renvoie la liste complète des compétences pour le client
   */
  getLayout(playerId) {
    return {
      choices: Object.entries(this.skills),           // ['dash','freeze','wall']
      selected: this.playerLayouts[playerId] || [] // loadout actuel du joueur
    };
  }

  /**
   * Enregistre le loadout sélectionné par le joueur
   */
  setLayout(playerId, selectedSkills) {
    const validSkills = Object.keys(this.skills);

    const filtered = selectedSkills
      .filter(s => validSkills.includes(s))
      .slice(0, this.config.game.maxSkills); // max skills

    this.playerLayouts[playerId] = filtered;
  }

  /**
   * Loadout final utilisé côté jeu
   */
  getPlayerLoadout(playerId) {
    return this.playerLayouts[playerId] || [];
  }

  // ================================
  // GAME LOOP
  // ================================
  update() {
    const { config } = this;
    const now = Date.now();

    // 🔹 Supprimer murs expirés
    this.walls = this.walls.filter(
      w => !w.expiresAt || w.expiresAt > now
    );

    // 🔹 Déplacement + pomme
    for (const id in this.snakes) {
      const snake = this.snakes[id];

      if (!snake.isFrozen || !snake.isFrozen()) {
        snake.move(config);
      }

      if (collide(snake.head(), this.apple.pos, config.game.gridSize)) {
        snake.grow();
        this.apple.respawn(config);
      }
    }

    this.checkCollisions();
  }

  // ================================
  // COLLISIONS
  // ================================
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

      // 💥 collision avec les autres serpents
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

      // 💥 collision avec murs
      for (const wall of this.walls) {
        if (collide(headA, wall, config.game.gridSize)) {
          A.reset(config);
          this.resetThisFrame.add(ids[i]);
        }
      }
    }
  }

  // ================================
  // UTILISATION DES COMPÉTENCES
  // ================================
  useSkill(playerId, skill) {
    if (!this.config.game.useSkills) return;

    const snake = this.snakes[playerId];
    if (!snake) return;

    // ❌ sécurité serveur : skill non équipée
    if (!snake.loadout || !snake.loadout.includes(skill)) return;
    const res = snake.useSkill(skill);
    if (skill === 'wall' && res) {
      this.walls.push(...res);
    }
  }

  // ================================
  // ÉTAT PUBLIC
  // ================================
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
