export class InputManager {
  constructor(scene) {
    this.scene = scene;

    // Déplacement flèches
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.lastDirection = { x: 0, y: 0 }; // direction actuelle envoyée
    if (this.scene.useSkills) {
      // Queue des skills
      this.skillQueue = [];

      // Stockage des handlers pour pouvoir les retirer si nécessaire
      this.skillHandlers = {};
    }}

  // === BIND DYNAMIQUE DES SKILLS ===
  bindSkills(playerSkills) {
    // Supprime les anciens listeners
    for (const bind in this.skillHandlers) {
      this.scene.input.keyboard.off(`keydown-${bind}`, this.skillHandlers[bind]);
    }
    this.skillHandlers = {};

    // Bind des nouveaux skills
    for (const [skillName, skill] of Object.entries(playerSkills)) {
      const handler = () => this._enqueueSkill(skillName);
      this.scene.input.keyboard.on(`keydown-${skill.bind}`, handler);
      this.skillHandlers[skill.bind] = handler;

      console.log(`Binding skill ${skillName} to key ${skill.bind}`);
    }
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
    return skill;
  }
}
