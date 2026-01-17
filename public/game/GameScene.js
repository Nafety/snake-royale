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
  }

  preload() {}

  create() {
    this.pixelSize = clientConfig.game.pixelSize;

    // Managers
    this.inputManager = new InputManager(this);
    this.renderer = new SnakeRenderer(this, this.pixelSize);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // ================== MENU ==================
    this.add.text(width / 2, height / 2 - 50, 'Choisissez un mode de jeu', {
      fontSize: '28px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Bouton Classic
    const classicBtn = this.add.text(width / 2, height / 2, 'Classic', {
      fontSize: '32px',
      fill: '#0f0'
    }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.startGame('classic', classicBtn, deathmatchBtn));

    // Bouton Deathmatch
    const deathmatchBtn = this.add.text(width / 2, height / 2 + 60, 'Deathmatch', {
      fontSize: '32px',
      fill: '#f00'
    }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.startGame('deathmatch', classicBtn, deathmatchBtn));
  }

  startGame(mode, btn1, btn2) {
    // Émettre l'événement joinGame avec le mode choisi
    socketManager.emit('joinGame', mode);

    // Détruire les boutons
    btn1.destroy();
    btn2.destroy();

    // Afficher message en attente
    this.statusText = this.add.text(10, 10, 'En attente d’un adversaire...', { fill: '#fff' });

    // Événements Socket
    socketManager.on('start', ({ playerId, config }) => {
      this.playerId = playerId;
      this.gameStarted = true;
      if (this.statusText) this.statusText.setText(`Partie démarrée (${mode}) !`);
    });

    socketManager.on('state', state => {
      if (!this.gameStarted) return;

      this.snakesData = state.snakes;

      // 🍎 pomme
      if (!this.apple) {
        this.renderer.createApple(state.apple.x, state.apple.y);
        this.apple = this.renderer.apple;
      } else {
        this.renderer.updateApple(state.apple.x, state.apple.y);
      }

      // 🐍 snakes
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

    // Gestion entrée clavier
    if (this.inputManager.update()) {
      const dir = this.inputManager.getDirection();
      socketManager.emit('input', dir);
    }
  }
}
