// server/Snake.js
class Snake {
  constructor(config, skillsDB = {}, loadout = []) {
    this.config = config;

    // 🔹 compétences disponibles globalement
    this.skillsDB = skillsDB;

    // 🔹 compétences équipées par le joueur
    this.loadout = loadout; // ['dash', 'freeze']

    // ===== Corps =====
    this.body = [{ ...config.game.snake.startPos }];
    this.length = config.game.snake.startLength;

    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    // ===== États =====
    this.effects = {};
    this.cooldowns = {};
    this.frozenUntil = 0;
  }

  // =========================
  // LOADOUT
  // =========================
  setLoadout(loadout = []) {
    this.loadout = loadout;
  }

  hasSkill(skill) {
    return this.loadout.includes(skill);
  }

  // =========================
  // INPUT
  // =========================
  setDirection(dir) {
    this.nextDir = dir;
  }

  // =========================
  // SKILLS CORE
  // =========================
  canUseSkill(name) {
    const skill = this.skillsDB[name];
    const now = Date.now();

    if (!skill) return false;
    if (!this.hasSkill(name)) return false;

    if (this.length <= skill.cost) return false;
    if (this.cooldowns[name] && this.cooldowns[name] > now) return false;

    // coût
    this.length -= skill.cost;
    this.cooldowns[name] = now + skill.cooldownMs;

    return true;
  }

  useSkill(name) {
    switch (name) {
      case 'dash':
        return this._dash();
      case 'freeze':
        return this._freeze();
      case 'wall':
        return this._wall();
      default:
        return false;
    }
  }

  // =========================
  // SKILL IMPLEMENTATIONS
  // =========================
  _dash() {
    const skill = this.skillsDB.dash;
    if (!this.canUseSkill('dash')) return false;

    for (let i = 0; i < skill.numberOfCells; i++) {
      this.move();
    }

    this.effects.dashUntil = Date.now() + skill;
    return true;
  }

  _freeze() {
    const skill = this.skillsDB.freeze;
    if (!this.canUseSkill('freeze')) return false;

    this.frozenUntil = Date.now() + skill.durationMs;
    return true;
  }

  _wall() {
    const skill = this.skillsDB.wall;
    if (!this.canUseSkill('wall')) return null;

    const head = this.head();
    const now = Date.now();
    const walls = [];

    for (let i = 1; i <= skill.numberOfCells; i++) {
      walls.push({
        x: head.x + i * this.dir.x,
        y: head.y + i * this.dir.y,
        expiresAt: now + (skill.durationMs || 5000)
      });
    }

    return walls;
  }

  // =========================
  // MOVE
  // =========================
  move() {
    if (this.isFrozen()) return;

    if (
      !this.config.game.snake.inversionAllowed &&
      this.dir.x + this.nextDir.x === 0 &&
      this.dir.y + this.nextDir.y === 0
    ) {
      // ignore demi-tour
    } else {
      this.dir = this.nextDir;
    }

    const head = this.head();
    let x = head.x + this.dir.x;
    let y = head.y + this.dir.y;

    const { width, height } = this.config.game.map;

    // wrapping
    if (x >= width) x = 0;
    if (x < 0) x = width - 1;
    if (y >= height) y = 0;
    if (y < 0) y = height - 1;

    this.body.push({ x, y });

    while (this.body.length > this.length) {
      this.body.shift();
    }
  }

  grow(amount = 1) {
    this.length += amount;
  }

  // =========================
  // RESET
  // =========================
  reset() {
    if (this.config.game.snake.respawnAfterDeath === false) {
      if (this.config.game.snake.dammageOnCollision) {
        this.length -= this.config.game.snake.dammageCollision;
        if (this.length < 1) this.length = 1;
      }
      return;
    }

    this.length = this.config.game.snake.respawnLength;
    this.body = [];

    for (let i = 0; i < this.length; i++) {
      this.body.push({ ...this.config.game.snake.startPos });
    }

    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    this.effects = {};
    this.cooldowns = {};
    this.frozenUntil = 0;
  }

  // =========================
  // HELPERS
  // =========================
  isFrozen() {
    return this.frozenUntil && Date.now() < this.frozenUntil;
  }

  head() {
    return this.body[this.body.length - 1];
  }

  getPublicState() {
    return {
      body: this.body,
      frozen: this.isFrozen(),
      effects: this.effects
    };
  }
}

module.exports = Snake;
