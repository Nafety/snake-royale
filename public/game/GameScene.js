import { InputManager } from './InputManager.js';
import { SnakeRenderer } from './SnakeRenderer.js';
import { socketManager } from '../socket/SocketManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.inputManager = null;
    this.renderer = null;

    this.snakesData = {};
    this.walls = [];
    this.apple = null;

    this.playerId = null;
    this.playerSnakeCreated = false;
    this.gameStarted = false;

    this.mode = null;
    this.config = null;
    this.skills = {};
    this.statusText = null;
  }

  init(data) {
    this.mode = data.mode;
    this.config = data.config;
    this.playerLoadout = data.loadout;
    this.gridWidth = this.config.gridWidth;
    this.gridHeight = this.config.gridHeight;

    this.paddingX = this.config.paddingX;
    this.paddingY = this.config.paddingY;
    this.useSkills = this.config.useSkills;
    this.calculatePixelSize(window.innerWidth, window.innerHeight);
  }

  create() {
    this.inputManager = new InputManager(this);

    this.statusText = this.add.text(
      10, 10,
      `En attente d’un adversaire (${this.mode})...`,
      { fill: '#fff', fontSize: '20px' }
    );

    socketManager.emit('joinGame', {
      mode: this.mode,
      loadout: this.playerLoadout
    });
    console.log('Emitted joinGame with payload:', { mode: this.mode, loadout: this.playerLoadout });
    this.scale.on('resize', (gameSize) => {
      this.onResize(gameSize.width, gameSize.height);
    });

    // ✅ START = point d’entrée réel de la partie
    socketManager.on('start', ({ playerId, skills, loadout }) => {
      console.log('Game started for playerId:', playerId, 'with skills:', skills, 'and loadout:', loadout);
      this.playerId = playerId;
      this.gameStarted = true;
      this.skills = skills;
      this.playerLoadout = loadout;

      this.gridWidth = this.config.gridWidth;
      this.gridHeight = this.config.gridHeight;
      this.paddingX = this.config.paddingX || 0;
      this.paddingY = this.config.paddingY || 0;

      this.calculatePixelSize(window.innerWidth, window.innerHeight);

      const offsetX = (window.innerWidth - this.gridWidth * this.pixelSize) / 2;
      const offsetY = (window.innerHeight - this.gridHeight * this.pixelSize) / 2;

      this.renderer = new SnakeRenderer(
        this,
        this.pixelSize,
        this.gridWidth,
        this.gridHeight,
        offsetX,
        offsetY
      );
      console.log('Renderer initialized with pixelSize:', this.pixelSize, 'offsetX:', offsetX, 'offsetY:', offsetY);
      if (this.useSkills) {
        // Hydratation des skills du joueur
        this.playerSkills = {};
        console.log('skills reçus du serveur:', this.skills);
        for (const itemId of loadout) {
          if (this.skills[itemId]) {
            this.playerSkills[itemId] = this.skills[itemId];
          }
        }
        console.log('playerSkills après hydratation:', this.playerSkills);
        this.inputManager.bindSkills(this.playerSkills);
        console.log('InputManager bindSkills called');
      }
      this.statusText.setText(`Partie démarrée (${this.mode}) !`);
    });

    socketManager.on('state', state => {
      if (!this.gameStarted || !this.renderer) return;
      this.snakesData = state.snakes;
      this.walls = state.walls;

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
            const head = snake.body.at(-1);
            this.renderer.createPlayerSnake(head.x, head.y);
            this.playerSnakeCreated = true;
          }
          this.renderer.updatePlayerBody(snake.body);
        } else {
          this.renderer.updateOtherSnakes({ [id]: snake }, this.playerId);
        }
      }

      this.renderer.updateWalls(this.walls);
    });

    socketManager.on('playerReset', () => {
      if (this.inputManager) {
        this.inputManager.lastDirection = { x: 0, y: 0 };
      }
    });
  }

  update() {
    if (!this.gameStarted || !this.playerSnakeCreated) return;

    if (this.inputManager.update()) {
      socketManager.emit('input', this.inputManager.getDirection());
    }

    while (this.inputManager.hasSkillInput()) {
      const skill = this.inputManager.consumeSkillInput();
      socketManager.emit('useSkill', { skill });
    }
  }

  calculatePixelSize(width, height) {
    const availableWidth = width - this.paddingX;
    const availableHeight = height - this.paddingY;
    this.pixelSize = Math.floor(
      Math.min(
        availableWidth / this.gridWidth,
        availableHeight / this.gridHeight
      )
    );
  }

  onResize(newWidth, newHeight) {
    if (!this.renderer || !this.config) return;

    this.calculatePixelSize(newWidth, newHeight);

    const offsetX = (newWidth - this.gridWidth * this.pixelSize) / 2;
    const offsetY = (newHeight - this.gridHeight * this.pixelSize) / 2;

    this.renderer.updatePixelSize(this.pixelSize, offsetX, offsetY);
    this.renderer.redraw(this.snakesData, this.apple, this.walls);
  }
}
