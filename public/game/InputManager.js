export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.lastDirection = { x: 0, y: 0 }; // direction actuelle envoyée
  }

  update() {
    let dir = { x: 0, y: 0 };

    if (this.cursors.left.isDown) dir = { x: -1, y: 0 };
    if (this.cursors.right.isDown) dir = { x: 1, y: 0 };
    if (this.cursors.up.isDown) dir = { x: 0, y: -1 };
    if (this.cursors.down.isDown) dir = { x: 0, y: 1 };

    // Interdire inversion immédiate (optionnel si tu as plusieurs segments)
     if (this.lastDirection.x + dir.x === 0 && this.lastDirection.y + dir.y === 0) {
       dir = this.lastDirection;
    }

    // Mettre à jour la direction actuelle
    if (dir.x !== 0 || dir.y !== 0) {
      this.lastDirection = dir;
      return true;
    }

    return false; // pas d’input
  }

  getDirection() {
    return { ...this.lastDirection }; // retourne la dernière direction valide
  }
}
