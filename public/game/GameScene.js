import { InputManager } from './InputManager.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { socketManager } from '../socket/SocketManager.js';

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

    this.gridWidth = null;
    this.gridHeight = null;
    this.pixelSize = null;
    this.config = null;
    this.paddingX = 0;
    this.paddingY = 0;
  }

  init(data) {
    this.mode = data.mode;
    this.config = data.config;
    console.log("Config de jeu reçue :", this.config);

    this.gridWidth = this.config.gridWidth;
    this.gridHeight = this.config.gridHeight;

    this.paddingX = this.config.paddingX || 0;
    this.paddingY = this.config.paddingY || 0;

    // calcul initial pixelSize
    this.calculatePixelSize(window.innerWidth, window.innerHeight);
  }

  create() {
    // calculer offset initial pour centrer la grille
    const offsetX = (window.innerWidth - this.gridWidth * this.pixelSize) / 2;
    const offsetY = (window.innerHeight - this.gridHeight * this.pixelSize) / 2;

    this.inputManager = new InputManager(this);
    this.renderer = new SnakeRenderer(this, this.pixelSize, this.gridWidth, this.gridHeight, offsetX, offsetY);

    socketManager.emit('joinGame', this.mode);

    this.statusText = this.add.text(
      10, 10,
      `En attente d’un adversaire (${this.mode})...`,
      { fill: '#fff', fontSize: '20px' }
    );

    // resize automatique
    this.scale.on('resize', (gameSize) => {
      this.onResize(gameSize.width, gameSize.height);
    });

    socketManager.on('start', ({ playerId }) => {
      this.playerId = playerId;
      this.gameStarted = true;
      if (this.statusText) this.statusText.setText(`Partie démarrée (${this.mode}) !`);
    });

    socketManager.on('state', state => {
      if (!this.gameStarted) return;
      this.snakesData = state.snakes;

      if (!this.apple) {
        this.renderer.createApple(state.apple.x, state.apple.y);
        this.apple = this.renderer.apple;
      } else {
        this.renderer.updateApple(state.apple.x, state.apple.y);
      }

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
  }

  update() {
    if (!this.playerSnakeCreated || !this.gameStarted) return;

    if (this.inputManager.update()) {
      const dir = this.inputManager.getDirection();
      socketManager.emit('input', dir);
    }
  }

  calculatePixelSize(width, height) {
    const availableWidth = width - this.paddingX;
    const availableHeight = height - this.paddingY;
    this.pixelSize = Math.floor(Math.min(availableWidth / this.gridWidth, availableHeight / this.gridHeight));
  }

  onResize(newWidth, newHeight) {
    this.calculatePixelSize(newWidth, newHeight);

    const offsetX = (newWidth - this.gridWidth * this.pixelSize) / 2;
    const offsetY = (newHeight - this.gridHeight * this.pixelSize) / 2;

    if (this.renderer) {
      this.renderer.updatePixelSize(this.pixelSize, offsetX, offsetY);
      this.renderer.redraw(this.snakesData, this.apple);
    }
  }
}