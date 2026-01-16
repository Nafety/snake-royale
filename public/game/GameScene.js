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
  }

  preload() {}

  create() {
    // 👇 Managers
    this.inputManager = new InputManager(this);
    this.renderer = new SnakeRenderer(this);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // ================== MENU ==================
    this.startBtn = this.add.text(width / 2, height / 2, 'Jouer', {
      fontSize: '32px',
      fill: '#0f0'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        socketManager.emit('joinGame');
        this.startBtn.destroy();
        this.statusText = this.add.text(10, 10, 'En attente d’un adversaire...', { fill: '#fff' });
      });

    // ================= SOCKET EVENTS =================

    // 🟢 Début partie
    socketManager.on('start', ({ playerId }) => {
      this.playerId = playerId;
      this.gameStarted = true;

      if (this.statusText) this.statusText.setText('Partie démarrée !');
      else this.add.text(10, 10, 'Partie démarrée !', { fill: '#0f0' });
    });

    // 🔄 Mise à jour état
    socketManager.on('state', state => {
      if (!this.gameStarted) return; // ignore avant start

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
          // joueur actuel
          if (!this.playerSnakeCreated) {
            const head = snake.body[snake.body.length - 1];
            this.renderer.createPlayerSnake(head.x, head.y);
            this.playerSnakeCreated = true;
          }
          this.renderer.updatePlayerBody(snake.body);
        } else {
          // adversaire
          this.renderer.updateOtherSnakes({ [id]: snake }, this.playerId);
        }
      }
    });
  }

  update() {
    if (!this.playerSnakeCreated || !this.gameStarted) return;

    // 📌 Gestion entrée clavier
    if (this.inputManager.update()) {
      const dir = this.inputManager.getDirection();
      socketManager.emit('input', dir);
    }
  }
}
