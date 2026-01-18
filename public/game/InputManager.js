export class InputManager {
  constructor(scene) {
    this.scene = scene;

    // Déplacement flèches
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.lastDirection = { x: 0, y: 0 }; // direction actuelle envoyée

    // Compétences AZER
    this.skillQueue = [];

    // Setup listeners pour chaque touche
    this.scene.input.keyboard.on('keydown-A', () => this._enqueueSkill('dash'));
    this.scene.input.keyboard.on('keydown-Z', () => this._enqueueSkill('freeze'));
    this.scene.input.keyboard.on('keydown-E', () => this._enqueueSkill('wall'));
    this.scene.input.keyboard.on('keydown-R', () => this._enqueueSkill('shield')); // futur
  }

  _enqueueSkill(skillName) {
    console.log(`Skill pressed: ${skillName}`);
    this.skillQueue.push(skillName);
  }

  // === DIRECTION ===
  update() {
    let dir = { x: 0, y: 0 };

    if (this.cursors.left.isDown) dir = { x: -1, y: 0 };
    else if (this.cursors.right.isDown) dir = { x: 1, y: 0 };
    else if (this.cursors.up.isDown) dir = { x: 0, y: -1 };
    else if (this.cursors.down.isDown) dir = { x: 0, y: 1 };

    if (dir.x !== 0 || dir.y !== 0) {
      this.lastDirection = dir;
      return true;
    }

    return false;
  }

  getDirection() {
    return { ...this.lastDirection };
  }

  // === SKILLS ===
  hasSkillInput() {
    return this.skillQueue.length > 0;
  }

  consumeSkillInput() {
    if (!this.hasSkillInput()) return null;
    const skill = this.skillQueue.shift();
    console.log(`Skill consumed: ${skill}`);
    return skill;
  }
}
