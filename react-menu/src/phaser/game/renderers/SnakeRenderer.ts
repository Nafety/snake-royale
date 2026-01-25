// react-menu/src/phaser/SnakeRenderer.ts
import Phaser from "phaser";

type GridPos = { x: number; y: number };
type SnakeState = {
  body: GridPos[];
  items?: GridPos[];
};

export class SnakeRenderer {
  scene: Phaser.Scene & { playerId?: string };
  PIXEL_SIZE: number;

  snakes: Record<string, RenderedSnake> = {};
  highlightedSnakeId: string | null = null;

  constructor(scene: Phaser.Scene, pixelSize: number) {
    this.scene = scene;
    this.PIXEL_SIZE = pixelSize;
  }

  /* ================= UTILS ================= */

  private gridToPixels(p: GridPos) {
    return {
      x: p.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y: p.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
    };
  }

  private createRect(color: number, sizeOffset = 0) {
    return this.scene.add.rectangle(
      0,
      0,
      this.PIXEL_SIZE - sizeOffset,
      this.PIXEL_SIZE - sizeOffset,
      color
    );
  }

  /* ================= MAIN UPDATE ================= */

  updateSnake(id: string, state: SnakeState, isPlayer: boolean) {
    if (!state.body.length) return;

    if (!this.snakes[id]) {
      this.snakes[id] = {
        head: this.createRect(isPlayer ? 0x00ff00 : 0x0000ff),
        body: [],
        walls: [],
      };
    }

    const snake = this.snakes[id];

    /* ---------- BODY ---------- */

    while (snake.body.length < state.body.length - 1) {
      snake.body.push(
        this.createRect(isPlayer ? 0x00cc00 : 0x0000cc, 4)
      );
    }

    while (snake.body.length > state.body.length - 1) {
      snake.body.pop()?.destroy();
    }

    for (let i = 0; i < state.body.length - 1; i++) {
      const pos = this.gridToPixels(state.body[i]);
      snake.body[i].setPosition(pos.x, pos.y);
    }

    const headPos = this.gridToPixels(state.body.at(-1)!);
    snake.head.setPosition(headPos.x, headPos.y);

    /* ---------- WALLS / ITEMS ---------- */

    const items = state.items ?? [];

    while (snake.walls.length < items.length) {
      snake.walls.push(this.createRect(0x888888));
    }

    while (snake.walls.length > items.length) {
      snake.walls.pop()?.destroy();
    }

    items.forEach((p, i) => {
      const pos = this.gridToPixels(p);
      snake.walls[i].setPosition(pos.x, pos.y);
    });

    /* ---------- HIGHLIGHT ---------- */

    const highlight = this.highlightedSnakeId === id;
    snake.body.forEach(r =>
      r.setFillStyle(highlight ? 0xffff00 : isPlayer ? 0x00cc00 : 0x0000cc)
    );
    snake.head.setFillStyle(highlight ? 0xffff00 : isPlayer ? 0x00ff00 : 0x0000ff);
  }

  /* ================= INTERACTION ================= */

  highlightSnake(id: string | null) {
    this.highlightedSnakeId = id;
  }

  removeSnake(id: string) {
    const snake = this.snakes[id];
    if (!snake) return;

    snake.head.destroy();
    snake.body.forEach(r => r.destroy());
    snake.walls.forEach(r => r.destroy());

    delete this.snakes[id];
  }

  /* ================= RESIZE ================= */

  resize(pixelSize: number) {
    this.PIXEL_SIZE = pixelSize;

    Object.values(this.snakes).forEach(s => {
      s.head.setSize(pixelSize, pixelSize);
      s.body.forEach(b => b.setSize(pixelSize - 4, pixelSize - 4));
      s.walls.forEach(w => w.setSize(pixelSize, pixelSize));
    });
  }

  /* ================= DESTROY ================= */

  destroy() {
    Object.keys(this.snakes).forEach(id => this.removeSnake(id));
    this.snakes = {};
    this.highlightedSnakeId = null;
  }
}

/* ================= TYPES ================= */

type RenderedSnake = {
  head: Phaser.GameObjects.Rectangle;
  body: Phaser.GameObjects.Rectangle[];
  walls: Phaser.GameObjects.Rectangle[];
};
