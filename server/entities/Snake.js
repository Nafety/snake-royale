// server/Snake.js
class Snake {
  constructor(config, skillsDB = {}, loadout = []) {
    this.config = config;
    this.skillsDB = skillsDB;
    this.loadout = loadout;

    // ===== Corps =====
    this.body = [{ ...config.game.snake.startPos }];
    this.length = config.game.snake.startLength;

    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    // ===== États =====
    this.effects = {};
    this.cooldowns = {};
    this.frozenUntil = 0;
    this.items = []; // murs posés par ce snake
  }

  /* =========================
     LOADOUT
  ========================= */

  setLoadout(loadout = []) {
    this.loadout = loadout;
  }

  hasSkill(skill) {
    return this.loadout.includes(skill);
  }

  /* =========================
     INPUT
  ========================= */

  setDirection(dir) {
    this.nextDir = dir;
  }

  /* =========================
     SKILLS CORE
  ========================= */

  canUseSkill(name) {
    const skill = this.skillsDB[name];
    const now = Date.now();

    if (!skill) return false;
    if (!this.hasSkill(name)) return false;
    if (this.length <= skill.cost) return false;
    if (this.cooldowns[name] && this.cooldowns[name] > now) return false;

    this.length -= skill.cost;
    this.cooldowns[name] = now + skill.cooldownMs;

    return true;
  }

  useSkill(name,targetSnake = null) {
    switch (name) {
      case 'dash':
        return this._dash();
      case 'freeze':
        return this._freeze();
      case 'wall':
        console.log(`🧱 ${this.id || 'player'} attempts to use wall skill on target ${targetSnake ? targetSnake.id || 'unknown' : 'none'}`);
        return this._wall(targetSnake);
      default:
        return false;
    }
  }

  /* =========================
     SKILL IMPLEMENTATIONS
  ========================= */

  _dash() {
    const skill = this.skillsDB.dash;
    if (!this.canUseSkill('dash')) return false;

    for (let i = 0; i < skill.numberOfCells; i++) {
      this.move();
    }

    this.effects.dashUntil = Date.now() + skill.durationMs;
    return true;
  }

  _freeze() {
    const skill = this.skillsDB.freeze;
    if (!this.canUseSkill('freeze')) return false;

    this.frozenUntil = Date.now() + skill.durationMs;
    return true;
  }

  // Snake.js
  _wall(targetSnake) {
      if (!targetSnake) return false;
      if (!this.canUseSkill('wall')) return false;

      console.log('Target Snake dir:', targetSnake.dir, 'items before:', targetSnake.items.length);

      targetSnake.addWall();

      console.log('Target Snake items after:', targetSnake.items.length);

      return true;
  }


    // addWall() pose le mur devant soi-même, perpendiculaire à la direction
  addWall() {
    const skill = this.skillsDB.wall;
    if (!skill) return;

    const now = Date.now();
    const wallLength = skill.numberOfCells || 3; // longueur du mur
    const distanceCells = skill.distanceCells || 1; // distance devant la tête

    const { width, height } = this.config.game.map;
    const wrapX = x => (x + width) % width;
    const wrapY = y => (y + height) % height;

    const head = this.head();
    const dx = this.dir.x;
    const dy = this.dir.y;

    if (dx === 0 && dy === 0) return; // pas de direction → pas de mur

    // Mur perpendiculaire → on inverse dx/dy pour l'axe du mur
    const wallAxisX = -dy; // si le snake va horizontal, mur sera vertical
    const wallAxisY = dx;

    // point central du mur
    const wallCenterX = head.x + dx * distanceCells;
    const wallCenterY = head.y + dy * distanceCells;

    // on centre le mur autour de wallCenter
    const half = Math.floor(wallLength / 2);

    for (let i = -half; i <= half; i++) {
      let x = wallCenterX + i * wallAxisX;
      let y = wallCenterY + i * wallAxisY;

      if (this.config.game.isTeleportationAllowed) {
        x = wrapX(x);
        y = wrapY(y);
      } else {
        if (x < 0 || x >= width || y < 0 || y >= height) {
          console.log('🧱 Wall cannot be placed, not enough space to the border.');
          continue; // ignore cette cellule
        }
      }

      this.items.push({
        x,
        y,
        expiresAt: skill.durationMs ? now + skill.durationMs : null
      });
    }

    console.log(`🧱 Wall skill used → +${wallLength} walls perpendicular in front of ${this.id || 'player'}`);
  }


  updateWalls(now = Date.now()) {
    if (!this.items) return;
    const before = this.items.length;
    this.items = this.items.filter(w => !w.expiresAt || w.expiresAt > now);
    const removed = before - this.items.length;
    if (removed > 0) {
      console.log(`🧱 ${this.id} removed ${removed} expired wall(s)`);
    }
  }

  /* =========================
     MOVE
  ========================= */

  move() {
    if (this.isFrozen()) return;

    if (
      !this.config.game.snake.inversionAllowed &&
      this.dir.x + this.nextDir.x === 0 &&
      this.dir.y + this.nextDir.y === 0
    ) {
      // demi-tour interdit
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

  /* =========================
     RESET
  ========================= */

  reset() {
    if (this.config.game.snake.respawnAfterDeath === false) {
      if (this.config.game.snake.dammageOnCollision) {
        this.length -= this.config.game.snake.dammageCollision;
        if (this.length < 1) this.length = 1;
      }
      return;
    }

    this.length = this.config.game.snake.startLength;
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

  /* =========================
     HELPERS
  ========================= */

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
      effects: this.effects,
      items: this.items,
      length: this.length,
      cooldowns: this.cooldowns
    };
  }
}

module.exports = Snake;
