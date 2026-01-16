export class SnakeRenderer {
  constructor(scene) {
    this.scene = scene;
    this.snakes = {};       // segments des adversaires
    this.playerSnake = null; // tête du joueur
    this.playerBody = [];   // corps du joueur
    this.apple = null;      // pomme
  }

  // Crée la tête du joueur
  createPlayerSnake(x, y) {
    this.playerSnake = this.scene.add.rectangle(x, y, 20, 20, 0x00ff00);
    return this.playerSnake;
  }

  // Crée la pomme
  createApple(x, y) {
    this.apple = this.scene.add.rectangle(x, y, 20, 20, 0xff0000);
    return this.apple;
  }

  // Met à jour la pomme
  updateApple(x, y) {
    if (this.apple) this.apple.setPosition(x, y);
  }

  // Met à jour le corps du joueur
  updatePlayerBody(body) {
    if (!this.playerSnake) return;

    // créer segments si nécessaire
    while (this.playerBody.length < body.length - 1) {
      const segment = this.scene.add.rectangle(0, 0, 16, 16, 0x00cc00);
      this.playerBody.push(segment);
    }
    while (this.playerBody.length > body.length - 1) {
      this.playerBody.pop().destroy();
    }

    // positionner segments
    for (let i = 0; i < body.length - 1; i++) {
      this.playerBody[i].setPosition(body[i].x, body[i].y);
    }

    // tête
    const head = body[body.length - 1];
    this.playerSnake.setPosition(head.x, head.y);
  }

  // Met à jour les snakes adverses
  updateOtherSnakes(snakesData, myId) {
    for (const id in snakesData) {
      if (id === myId) continue;

      const body = snakesData[id].body;
      if (!this.snakes[id]) this.snakes[id] = [];

      // créer segments si nécessaire
      while (this.snakes[id].length < body.length) {
        const segment = this.scene.add.rectangle(0, 0, 20, 20, 0x0000ff);
        this.snakes[id].push(segment);
      }
      while (this.snakes[id].length > body.length) {
        this.snakes[id].pop().destroy();
      }

      // positionner segments
      for (let i = 0; i < body.length; i++) {
        this.snakes[id][i].setPosition(body[i].x, body[i].y);
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
