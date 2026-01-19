class Snake {
  constructor(config, skills = {}) {
    this.config = config;
    this.skills = skills; // compétences du joueur

    // Corps du serpent
    this.body = [{ ...config.game.snake.startPos }];
    this.length = config.game.snake.startLength;
    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    // Gestion des effets / cooldowns
    this.effects = {};        // ex: { dashUntil: timestamp }
    this.cooldowns = {};      // ex: { dash: timestamp }
    this.frozenUntil = 0;
  }

  // ====== Direction ======
  setDirection(dir) {
    this.nextDir = dir; // stocke seulement l’intention
  }

  // ====== Compétences ======
  canUseSkill(name, costLength, cooldownMs) {
    const now = Date.now();

    if (this.length <= costLength) return false;
    if (this.cooldowns[name] && this.cooldowns[name] > now) return false;

    this.length -= costLength;       // coût en longueur
    this.cooldowns[name] = now + cooldownMs;
    return true;
  }

  tryDash() {
    const skill = this.skills.dash;
    if (!skill) return false;

    if (!this.canUseSkill('dash', skill.cost, skill.cooldownMs)) return false;

    for (let i = 0; i < skill.numberOfCells; i++) {
      this.move();
    }

    this.effects.dashUntil = Date.now() + 200;
    return true;
  }

  applyFreeze() {
    const skill = this.skills.freeze;
    if (!skill) return false;

    if (!this.canUseSkill('freeze', skill.cost, skill.cooldownMs)) return false;

    this.frozenUntil = Date.now() + skill.durationMs;
    return true;
  }

  tryWall() {
    const skill = this.skills.wall;
    if (!skill) return null;

    if (!this.canUseSkill('wall', skill.cost, skill.cooldownMs)) return null;

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

  // ====== Déplacement ======
  move() {
    if (this.isFrozen()) return;

    if (
      !this.config.game.snake.inversionAllowed &&
      this.dir.x + this.nextDir.x === 0 &&
      this.dir.y + this.nextDir.y === 0
    ) {
      // ignore le virage
    } else {
      this.dir = this.nextDir;
    }

    const head = this.head();
    let nextX = head.x + this.dir.x;
    let nextY = head.y + this.dir.y;

    const maxX = this.config.game.map.width;
    const maxY = this.config.game.map.height;

    // Wrapping
    if (nextX >= maxX) nextX = 0;
    if (nextX < 0) nextX = maxX - 1;
    if (nextY >= maxY) nextY = 0;
    if (nextY < 0) nextY = maxY - 1;

    this.body.push({ x: nextX, y: nextY });

    while (this.body.length > this.length) {
      this.body.shift();
    }
  }

  grow(amount = 1) {
    this.length += amount;
  }

  // ====== Reset / Mort ======
  reset() {
    if (this.config.game.snake.respawnAfterDeath === false) {
      if (this.config.game.snake.dammageOnCollision) {
        this.length -= this.config.game.snake.dammageCollision;
        if (this.length < 1) this.length = 1;
      }
    } else {
      this.length = this.config.game.snake.respawnLength;
      this.body = [];
      for (let i = 0; i < this.length; i++) {
        this.body.push({ ...this.config.game.snake.startPos });
      }
      this.dir = { x: 0, y: 0 };
      this.effects = {};
      this.cooldowns = {};
      this.frozenUntil = 0;
    }
  }

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
