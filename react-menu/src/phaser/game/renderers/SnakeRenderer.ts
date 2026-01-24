// react-menu/src/phaser/SnakeRenderer.ts
import Phaser from "phaser";

type GridPos = { x: number; y: number };
type SnakeBody = GridPos[];
type SnakeData = { body: SnakeBody };
type SnakesData = Record<string, SnakeData>;

export class SnakeRenderer {
  scene: Phaser.Scene & { playerId?: string };
  PIXEL_SIZE: number;

  snakes: Record<string, Phaser.GameObjects.Rectangle[]> = {};
  playerSnake: Phaser.GameObjects.Rectangle | null = null;
  playerBody: Phaser.GameObjects.Rectangle[] = [];
  highlightedSnakeId: string | null = null;

  constructor(scene: Phaser.Scene, pixelSize: number) {
    this.scene = scene;
    this.PIXEL_SIZE = pixelSize;
  }

  private gridToPixels(gridPos: GridPos) {
    return {
      x: gridPos.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y: gridPos.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
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

    // supprimer les segments en trop
    while (this.playerBody.length > body.length - 1) {
      this.playerBody.pop()?.destroy();
    }

    // positionner tous les segments
    for (let i = 0; i < body.length - 1; i++) {
      const pos = this.gridToPixels(body[i]);
      this.playerBody[i].setPosition(pos.x, pos.y);
    }

    // positionner la tête
    const headPos = this.gridToPixels(body[body.length - 1]);
    this.playerSnake.setPosition(headPos.x, headPos.y);
  }

  updateOtherSnakes(snakesData: SnakesData, myId: string) {
    if (!this.scene) return;

    for (const id in snakesData) {
      if (id === myId) continue;

      const body = snakesData[id].body;
      if (!body.length) continue;

      if (!this.snakes[id]) this.snakes[id] = [];

      // créer les segments manquants
      while (this.snakes[id].length < body.length) {
        this.snakes[id].push(
          this.scene.add.rectangle(
            0,
            0,
            this.PIXEL_SIZE,
            this.PIXEL_SIZE,
            0x0000ff
          )
        );
      }

      // supprimer les segments en trop
      while (this.snakes[id].length > body.length) {
        this.snakes[id].pop()?.destroy();
      }

      // positionner tous les segments
      body.forEach((seg, i) => {
        const pos = this.gridToPixels(seg);
        this.snakes[id][i].setPosition(pos.x, pos.y);

        // couleur si highlight
        if (this.highlightedSnakeId === id) {
          this.snakes[id][i].setFillStyle(0xffff00);
        } else {
          this.snakes[id][i].setFillStyle(0x0000ff);
        }
      });
    }
  }

  highlightSnake(targetId: string | null) {
    this.highlightedSnakeId = targetId;
    for (const id in this.snakes) {
      this.snakes[id].forEach(rect => {
        rect.setFillStyle(id === targetId ? 0xffff00 : 0x0000ff);
      });
    }
  }

  removeHighlight() {
    this.highlightSnake(null);
  }

  resize(pixelSize: number) {
    this.PIXEL_SIZE = pixelSize;
    if (this.playerSnake) this.playerSnake.setSize(pixelSize, pixelSize);
    this.playerBody.forEach(r => r.setSize(pixelSize, pixelSize));
    Object.values(this.snakes).flat().forEach(r => r.setSize(pixelSize, pixelSize));
  }

  destroy() {
    this.playerSnake?.destroy();
    this.playerSnake = null;

    this.playerBody.forEach(r => r.destroy());
    this.playerBody = [];

    Object.values(this.snakes).flat().forEach(r => r.destroy());
    this.snakes = {};
    this.highlightedSnakeId = null;
  }
}
