// react-menu/src/phaser/SnakeRenderer.ts
import Phaser from "phaser";

type GridPos = { x: number; y: number };
type SnakeBody = GridPos[];
type SnakeData = { body: SnakeBody };
type SnakesData = Record<string, SnakeData>;
type WallData = GridPos[];

export class SnakeRenderer {
  scene: Phaser.Scene & { playerId?: string };
  PIXEL_SIZE: number;
  gridWidth: number;
  gridHeight: number;
  offsetX: number;
  offsetY: number;

  snakes: Record<string, Phaser.GameObjects.Rectangle[]>;
  playerSnake: Phaser.GameObjects.Rectangle | null;
  playerBody: Phaser.GameObjects.Rectangle[];
  apple: Phaser.GameObjects.Rectangle | null;
  walls: Phaser.GameObjects.Rectangle[];

  constructor(
    scene: Phaser.Scene & { playerId?: string },
    pixelSize: number,
    gridWidth: number,
    gridHeight: number,
    offsetX = 0,
    offsetY = 0
  ) {
    this.scene = scene;
    this.PIXEL_SIZE = pixelSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.snakes = {};
    this.playerSnake = null;
    this.playerBody = [];
    this.apple = null;
    this.walls = [];
  }

  gridToPixels(gridPos: GridPos) {
    return {
      x: this.offsetX + gridPos.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y: this.offsetY + gridPos.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
    };
  }

  createPlayerSnake(x: number, y: number) {
    const pos = this.gridToPixels({ x, y });
    this.playerSnake = this.scene.add.rectangle(
      pos.x,
      pos.y,
      this.PIXEL_SIZE,
      this.PIXEL_SIZE,
      0x00ff00
    );
    return this.playerSnake;
  }

  createApple(x: number, y: number) {
    const pos = this.gridToPixels({ x, y });
    this.apple = this.scene.add.rectangle(
      pos.x,
      pos.y,
      this.PIXEL_SIZE,
      this.PIXEL_SIZE,
      0xff0000
    );
    return this.apple;
  }

  updateApple(x: number, y: number) {
    if (!this.apple) return;
    const pos = this.gridToPixels({ x, y });
    this.apple.setPosition(pos.x, pos.y);
  }

  updatePlayerBody(body: SnakeBody) {
    if (!this.playerSnake) return;

    while (this.playerBody.length < body.length - 1) {
      const seg = this.scene.add.rectangle(
        0,
        0,
        this.PIXEL_SIZE - 4,
        this.PIXEL_SIZE - 4,
        0x00cc00
      );
      this.playerBody.push(seg);
    }
    while (this.playerBody.length > body.length - 1) {
      this.playerBody.pop()?.destroy();
    }

    for (let i = 0; i < body.length - 1; i++) {
      const pos = this.gridToPixels(body[i]);
      this.playerBody[i].setPosition(pos.x, pos.y);
    }

    const headPos = this.gridToPixels(body[body.length - 1]);
    this.playerSnake.setPosition(headPos.x, headPos.y);
  }

  updateOtherSnakes(snakesData: SnakesData, myId: string) {
    for (const id in snakesData) {
      if (id === myId) continue;
      const body = snakesData[id].body;
      if (!this.snakes[id]) this.snakes[id] = [];

      while (this.snakes[id].length < body.length) {
        const seg = this.scene.add.rectangle(
          0,
          0,
          this.PIXEL_SIZE,
          this.PIXEL_SIZE,
          0x0000ff
        );
        this.snakes[id].push(seg);
      }
      while (this.snakes[id].length > body.length) {
        this.snakes[id].pop()?.destroy();
      }

      for (let i = 0; i < body.length; i++) {
        const pos = this.gridToPixels(body[i]);
        this.snakes[id][i].setPosition(pos.x, pos.y);
      }
    }
  }

  updateWalls(walls: WallData) {
    walls = walls || [];

    while (this.walls.length > walls.length) {
      this.walls.pop()?.destroy();
    }

    while (this.walls.length < walls.length) {
      const rect = this.scene.add.rectangle(
        0,
        0,
        this.PIXEL_SIZE,
        this.PIXEL_SIZE,
        0x888888
      );
      this.walls.push(rect);
    }

    for (let i = 0; i < walls.length; i++) {
      const pos = this.gridToPixels(walls[i]);
      this.walls[i].setPosition(pos.x, pos.y);
    }
  }

  updatePixelSize(newPixelSize: number, offsetX: number | null = null, offsetY: number | null = null) {
    this.PIXEL_SIZE = newPixelSize;
    if (offsetX !== null) this.offsetX = offsetX;
    if (offsetY !== null) this.offsetY = offsetY;
  }

  redraw(snakesData: SnakesData, apple: GridPos | null, walls: WallData | null) {
    // Player snake
    if (this.playerSnake && this.playerBody.length && this.scene.playerId && snakesData[this.scene.playerId]) {
      const playerBody = snakesData[this.scene.playerId].body;
      for (let i = 0; i < this.playerBody.length; i++) {
        const pos = this.gridToPixels(playerBody[i]);
        this.playerBody[i].setPosition(pos.x, pos.y);
      }
      const headPos = this.gridToPixels(playerBody[playerBody.length - 1]);
      this.playerSnake.setPosition(headPos.x, headPos.y);
    }

    // Other snakes
    for (const id in snakesData) {
      if (id === this.scene.playerId) continue;
      const body = snakesData[id].body;
      if (!this.snakes[id]) continue;
      for (let i = 0; i < body.length; i++) {
        const pos = this.gridToPixels(body[i]);
        this.snakes[id][i].setPosition(pos.x, pos.y);
      }
    }

    // Apple
    if (apple) this.updateApple(apple.x, apple.y);

    // Walls
    if (walls) this.updateWalls(walls);
  }
}
