import Phaser from "phaser";
import { InputManager } from "./InputManager";
import { SnakeRenderer } from "./renderers/SnakeRenderer";
import { AppleRenderer } from "./renderers/AppleRenderer";
import { MapRenderer } from "./renderers/MapRenderer";
import { socketManager } from "../socket/SocketManager";

/* =========================
        TYPES
========================= */
export type Skill = { bind: string };

export type InitData = {
  mode: string;
  config: any;
  skills: Record<string, Skill>;
  loadout: string[];
  playerId?: string;
};

type GridPos = { x: number; y: number };

type SnakeState = {
  body: GridPos[];
  items: GridPos[];
  frozen: boolean;
  effects: Record<string, any>;
  length: number;
  cooldowns: Record<string, number>;
};

type MapState = {
  borders: GridPos[];
  // plus tard:
  // obstacles?: GridPos[];
};

type GameState = {
  snakes: Record<string, SnakeState>;
  map: MapState;
  apple: GridPos;
};


/* =========================
        SCENE
========================= */
export class GameScene extends Phaser.Scene {
  // ----- init data -----
  mode!: string;
  config: any;
  skills: Record<string, Skill> = {};
  playerLoadout: string[] = [];
  playerId: string | null = null;

  // ----- systems -----
  inputManager?: InputManager;
  snakeRenderer?: SnakeRenderer;
  appleRenderer?: AppleRenderer;
  mapRenderer?: MapRenderer;

  // ----- state -----
  snakesData: Record<string, SnakeState> = {};
  mapRendered = false;

  playerSnakeCreated = false;
  gameStarted = false;
  selectedSnakeId: string | null = null;

  pixelSize = 0;
  gridWidth = 0;
  gridHeight = 0;

  // ----- socket handlers -----
  private handleState!: (state: GameState) => void;
  private handlePlayerReset!: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  /* =========================
          INIT
  ========================= */
  init(data: InitData) {
    this.mode = data.mode;
    this.config = data.config;
    this.skills = data.skills;
    this.playerLoadout = data.loadout;
    this.playerId = data.playerId ?? null;

    this.gridWidth = this.config.gridWidth;
    this.gridHeight = this.config.gridHeight;

    this.pixelSize = Math.floor(
      Math.min(
        window.innerWidth / this.gridWidth,
        window.innerHeight / this.gridHeight
      )
    );
  }

  /* =========================
          CREATE
  ========================= */
  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    /* ---------- INPUT ---------- */
    this.inputManager = new InputManager(this);

    if (this.config.useSkills) {
      const boundSkills: Record<string, Skill> = {};
      for (const id of this.playerLoadout) {
        if (this.skills[id]) boundSkills[id] = this.skills[id];
      }
      this.inputManager.bindSkills(boundSkills);
    }

    /* ---------- RENDERERS ---------- */
    this.mapRenderer = new MapRenderer(this, this.pixelSize);
    this.snakeRenderer = new SnakeRenderer(this, this.pixelSize);
    this.appleRenderer = new AppleRenderer(this, this.pixelSize);

    this.gameStarted = true;

    /* ---------- POINTER (target snake) ---------- */
    this.input.on("pointerdown", pointer => {
      if (!this.sys?.isActive()) return;

      const x = Math.floor(pointer.x / this.pixelSize);
      const y = Math.floor(pointer.y / this.pixelSize);

      let target: string | null = null;
      for (const id in this.snakesData) {
        if (id === this.playerId) continue;
        if (this.snakesData[id].body.some(p => p.x === x && p.y === y)) {
          target = id;
          break;
        }
      }

      this.selectedSnakeId = target;
      this.snakeRenderer?.highlightSnake(target);
    });

    /* ---------- SOCKETS ---------- */
    this.handleState = (state: GameState) => {
      if (!this.sys?.isActive()) return;
      if (!this.snakeRenderer || !this.appleRenderer || !this.mapRenderer) return;

      this.snakesData = state.snakes;

      /* ----- MAP (STATIC, ONCE) ----- */
      if (!this.mapRendered) {
        this.mapRenderer.render(state.map.borders);
        this.mapRendered = true;
      }

      /* ----- APPLE ----- */
      if (!this.appleRenderer.apple) {
        this.appleRenderer.create(state.apple.x, state.apple.y);
      } else {
        this.appleRenderer.update(state.apple.x, state.apple.y);
      }

      /* ----- SNAKES + SNAKE WALLS ----- */
      for (const id in state.snakes) {
        const snakeState = state.snakes[id];
        const isPlayer = id === this.playerId;
        
        if (isPlayer && !this.playerSnakeCreated) {
          this.playerSnakeCreated = true;
        }

        this.snakeRenderer.updateSnake(id, snakeState, isPlayer);
      }
    };

    this.handlePlayerReset = () => {
      if (!this.inputManager) return;
      this.inputManager.lastDirection = { x: 0, y: 0 };
      this.inputManager.skillQueue = [];
    };

    socketManager.on("state", this.handleState);
    socketManager.on("playerReset", this.handlePlayerReset);
  }

  /* =========================
          UPDATE
  ========================= */
  update() {
    if (!this.sys?.isActive()) return;
    if (!this.gameStarted || !this.playerSnakeCreated) return;

    if (this.inputManager?.update()) {
      socketManager.emit("input", this.inputManager.getDirection());
    }

    while (this.inputManager?.hasSkillInput()) {
      const skill = this.inputManager.consumeSkillInput();
      socketManager.emit("useSkill", {
        skill,
        targetId: this.selectedSnakeId,
      });
    }
  }

  /* =========================
          SHUTDOWN
  ========================= */
  private onShutdown() {
    socketManager.off("state", this.handleState);
    socketManager.off("playerReset", this.handlePlayerReset);

    this.input.removeAllListeners();

    this.snakeRenderer?.destroy();
    this.appleRenderer?.destroy();
    this.mapRenderer?.destroy();

    this.inputManager = undefined;
    this.snakeRenderer = undefined;
    this.appleRenderer = undefined;
    this.mapRenderer = undefined;

    this.gameStarted = false;
    this.playerSnakeCreated = false;
    this.selectedSnakeId = null;
    this.mapRendered = false;
  }
}
