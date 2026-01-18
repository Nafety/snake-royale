import { InputManager } from './InputManager.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { socketManager } from '../socket/SocketManager.js';
import { clientConfig } from '../config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.inputManager = null;
    this.renderer = null;
    this.snakesData = {};
    this.playerId = null;
    this.playerSnakeCreated = false;
    this.apple = null;
    this.gameStarted = false;
    this.statusText = null;
    this.mode = null;
  }

  preload() {}

  init(data) {
    this.mode = data.mode;
  }

  create() {
    this.pixelSize = clientConfig.game.pixelSize;

    this.inputManager = new InputManager(this);
    this.renderer = new SnakeRenderer(this, this.pixelSize);

    // Connexion serveur avec le mode reçu
    socketManager.emit('joinGame', this.mode);

    this.statusText = this.add.text(
      10,
      10,
      `En attente d’un adversaire (${this.mode})...`,
      { fill: '#fff' }
    );

    socketManager.on('start', ({ playerId, config }) => {
      this.playerId = playerId;
      this.gameStarted = true;
      this.statusText.setText(`Partie démarrée (${this.mode}) !`);
    });

    socketManager.on('state', state => {
      if (!this.gameStarted) return;

      this.snakesData = state.snakes;

      // pomme
      if (!this.apple) {
        this.renderer.createApple(state.apple.x, state.apple.y);
        this.apple = this.renderer.apple;
      } else {
        this.renderer.updateApple(state.apple.x, state.apple.y);
      }

      // snakes
      for (const id in state.snakes) {
        const snake = state.snakes[id];
        if (id === this.playerId) {
          if (!this.playerSnakeCreated) {
            const head = snake.body[snake.body.length - 1];
            this.renderer.createPlayerSnake(head.x, head.y);
            this.playerSnakeCreated = true;
          }
          this.renderer.updatePlayerBody(snake.body);
        } else {
          this.renderer.updateOtherSnakes({ [id]: snake }, this.playerId);
        }
      }
    });

    // 🔄 Reset de la direction quand le serpent respawn
    socketManager.on('playerReset', () => {
      if (this.inputManager) {
        this.inputManager.lastDirection = { x: 0, y: 0 }; // Reset à droite (direction initiale)
      }
    });
  }

  update() {
    if (!this.playerSnakeCreated || !this.gameStarted) return;

    // Gestion entrée clavier
    if (this.inputManager.update()) {
      const dir = this.inputManager.getDirection();
      socketManager.emit('input', dir);
    }
  }
}
