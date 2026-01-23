// src/phaser/GameScene.ts
import Phaser from "phaser";
import { InputManager } from "./InputManager";
import { SnakeRenderer } from "./renderers/SnakeRenderer";
import { AppleRenderer } from "./renderers/AppleRenderer";
import { WallRenderer } from "./renderers/WallRenderer";
import { socketManager } from "../socket/SocketManager";

export type Skill = { bind: string };
export type InitData = {
  mode: string;
  config: any;
  skills: Record<string, Skill>;
  loadout: string[];
  playerId?: string;
};

type SnakeState = { body: { x: number; y: number }[] };
type GameState = { snakes: Record<string, SnakeState>; walls: any[]; apple: { x: number; y: number } };

export class GameScene extends Phaser.Scene {
  mode!: string;
  config: any;
  skills: Record<string, Skill> = {};
  playerLoadout: string[] = [];
  playerId: string | null = null;

  inputManager: InputManager | null = null;
  snakeRenderer: SnakeRenderer | null = null;
  appleRenderer: AppleRenderer | null = null;
  wallRenderer: WallRenderer | null = null;
  snakesData: Record<string, SnakeState> = {};
  walls: any[] = [];
  playerSnakeCreated = false;
  gameStarted = false;

  pixelSize = 0;
  gridWidth = 0;
  gridHeight = 0;

  constructor() {
    super({ key: "GameScene" });
    console.log("[GameScene] constructor called");
  }

  init(data: InitData) {
    console.log("[GameScene] init", data);
    this.mode = data.mode;
    this.config = data.config;
    this.skills = data.skills;
    this.playerLoadout = data.loadout;
    this.playerId = data.playerId || null;

    this.gridWidth = this.config.gridWidth;
    this.gridHeight = this.config.gridHeight;
    this.calculatePixelSize(window.innerWidth, window.innerHeight);
  }

  create() {
    console.log("[GameScene] create called");

    // === Input Manager ===
    this.inputManager = new InputManager(this);

    // Bind dynamique des skills du joueur
    if (this.inputManager) {
      const playerSkills: Record<string, Skill> = {};
      this.playerLoadout.forEach(skillId => {
        if (this.skills[skillId]) playerSkills[skillId] = this.skills[skillId];
      });
      this.inputManager.bindSkills(playerSkills);
    }

    // === Snake Renderers ===
    this.snakeRenderer = new SnakeRenderer(this, this.pixelSize);
    this.appleRenderer = new AppleRenderer(this, this.pixelSize);
    this.wallRenderer = new WallRenderer(this, this.pixelSize);

    this.gameStarted = true;

    // === Socket events ===
    socketManager.on("state", (state: GameState) => {
      console.log("[GameScene] state received", state);
      if (!this.snakeRenderer || !this.gameStarted) return;

      this.snakesData = state.snakes;
      this.walls = state.walls;

      // Apple
      if (!this.appleRenderer) return;
      if (!this.appleRenderer.apple) {
          this.appleRenderer.create(state.apple.x, state.apple.y);
      } else {
          this.appleRenderer.update(state.apple.x, state.apple.y);
      }


      // Snakes
      for (const id in state.snakes) {
        const snake = state.snakes[id];
        if (id === this.playerId) {
          if (!this.playerSnakeCreated) {
            const head = snake.body.at(-1)!;
            this.snakeRenderer.createPlayerSnake(head.x, head.y);
            this.playerSnakeCreated = true;
          }
          this.snakeRenderer.updatePlayerBody(snake.body);
        } else {
          this.snakeRenderer.updateOtherSnakes({ [id]: snake }, this.playerId!);
        }
      }

      this.wallRenderer?.update(this.walls);
    });

    // Reset du joueur
    socketManager.on("playerReset", () => {
      console.log("[GameScene] playerReset received");
      if (this.inputManager) {
        this.inputManager.lastDirection = { x: 0, y: 0 };
        this.inputManager.skillQueue = []; // vider la queue des skills
      }
    });
  }

  update() {
    if (!this.gameStarted || !this.playerSnakeCreated) return;

    // Direction
    if (this.inputManager?.update()) {
      socketManager.emit("input", this.inputManager.getDirection());
    }

    // Skills
    while (this.inputManager?.hasSkillInput()) {
      const skill = this.inputManager.consumeSkillInput();
      socketManager.emit("useSkill", { skill });
    }
  }

  private calculatePixelSize(width: number, height: number) {
    this.pixelSize = Math.floor(Math.min(width / this.gridWidth, height / this.gridHeight));
    console.log("[GameScene] calculatePixelSize", this.pixelSize);
  }
}
