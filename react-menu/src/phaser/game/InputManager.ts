// react-menu/src/phaser/InputManager.ts
import Phaser from "phaser";

type Direction = { x: number; y: number };

type Skill = {
  bind: string;
};

export class InputManager {
  scene: Phaser.Scene & { useSkills?: boolean };
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastDirection: Direction;

  // Skills
  skillQueue: string[];
  skillHandlers: Record<string, (event?: KeyboardEvent) => void>;

  constructor(scene: Phaser.Scene & { useSkills?: boolean }) {
    this.scene = scene;

    // Déplacement flèches
    if (!scene.input.keyboard) {
      throw new Error("Keyboard input not enabled on this scene!");
    }

    this.cursors = scene.input.keyboard.createCursorKeys();

    this.lastDirection = { x: 0, y: 0 };

    // Skills
    this.skillQueue = [];
    this.skillHandlers = {};
  }

  // === BIND DYNAMIQUE DES SKILLS ===
  bindSkills(playerSkills: Record<string, Skill>) {
    // Supprime les anciens listeners
    if (!this.scene.input.keyboard) {
      throw new Error("Keyboard input not enabled on this scene!");
    }
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

  private _enqueueSkill(skillName: string) {
    console.log(`Skill pressed: ${skillName}`);
    this.skillQueue.push(skillName);
  }

  // === DIRECTION ===
  update(): boolean {
    let dir: Direction = { x: 0, y: 0 };

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

  getDirection(): Direction {
    return { ...this.lastDirection };
  }

  // === SKILLS ===
  hasSkillInput(): boolean {
    return this.skillQueue.length > 0;
  }

  consumeSkillInput(): string | null {
    if (!this.hasSkillInput()) return null;
    const skill = this.skillQueue.shift()!;
    return skill;
  }
}
