export class SnakeRenderer {
  constructor(scene, pixelSize) {
    this.scene = scene;
    this.snakes = {};       // segments des adversaires
    this.playerSnake = null; // tête du joueur
    this.playerBody = [];   // corps du joueur
    this.apple = null;      // pomme
    this.PIXEL_SIZE = pixelSize;   // Chaque cellule grille en pixels (depuis config.js)
  }

  // Convertit coordonnées GRILLE en PIXELS
  gridToPixels(gridPos) {
    return {
      x: gridPos.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y: gridPos.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2
    };
  }

  // Crée la tête du joueur
  createPlayerSnake(x, y) {
    const pixelPos = this.gridToPixels({ x, y });
    this.playerSnake = this.scene.add.rectangle(pixelPos.x, pixelPos.y, this.PIXEL_SIZE, this.PIXEL_SIZE, 0x00ff00);
    return this.playerSnake;
  }

  // Crée la pomme
  createApple(x, y) {
    const pixelPos = this.gridToPixels({ x, y });
    this.apple = this.scene.add.rectangle(pixelPos.x, pixelPos.y, this.PIXEL_SIZE, this.PIXEL_SIZE, 0xff0000);
    return this.apple;
  }

  // Met à jour la pomme
  updateApple(x, y) {
    if (this.apple) {
      const pixelPos = this.gridToPixels({ x, y });
      this.apple.setPosition(pixelPos.x, pixelPos.y);
    }
  }

  // Met à jour le corps du joueur
  updatePlayerBody(body) {
    if (!this.playerSnake) return;

    // créer segments si nécessaire
    while (this.playerBody.length < body.length - 1) {
      const segment = this.scene.add.rectangle(0, 0, this.PIXEL_SIZE - 4, this.PIXEL_SIZE - 4, 0x00cc00);
      this.playerBody.push(segment);
    }
    while (this.playerBody.length > body.length - 1) {
      this.playerBody.pop().destroy();
    }

    // positionner segments en pixels
    for (let i = 0; i < body.length - 1; i++) {
      const pixelPos = this.gridToPixels(body[i]);
      this.playerBody[i].setPosition(pixelPos.x, pixelPos.y);
    }

    // tête
    const headPixelPos = this.gridToPixels(body[body.length - 1]);
    this.playerSnake.setPosition(headPixelPos.x, headPixelPos.y);
  }

  // Met à jour les snakes adverses
  updateOtherSnakes(snakesData, myId) {
    for (const id in snakesData) {
      if (id === myId) continue;

      const body = snakesData[id].body;
      if (!this.snakes[id]) this.snakes[id] = [];

      // créer segments si nécessaire
      while (this.snakes[id].length < body.length) {
        const segment = this.scene.add.rectangle(0, 0, this.PIXEL_SIZE, this.PIXEL_SIZE, 0x0000ff);
        this.snakes[id].push(segment);
      }
      while (this.snakes[id].length > body.length) {
        this.snakes[id].pop().destroy();
      }

      // positionner segments en pixels
      for (let i = 0; i < body.length; i++) {
        const pixelPos = this.gridToPixels(body[i]);
        this.snakes[id][i].setPosition(pixelPos.x, pixelPos.y);
      }
    }
  }

  // Message flottant
  displayMessage(text, duration = 2000) {
    const msg = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      50,
      text,
      { fontSize: '24px', fill: '#fff', backgroundColor: '#000', padding: { x: 10, y: 5 } }
    );
    msg.setOrigin(0.5);
    this.scene.time.delayedCall(duration, () => msg.destroy());
  }
}
