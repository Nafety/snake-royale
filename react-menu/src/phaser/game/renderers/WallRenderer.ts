// src/phaser/renderers/WallRenderer.ts
import Phaser from "phaser";

export type GridPos = { x: number; y: number };

export interface WallsState {
  borders: GridPos[];
}

export interface SnakeWallsState {
  items: GridPos[];
}

export class WallRenderer {
  scene: Phaser.Scene;
  PIXEL_SIZE: number;

  // tableaux séparés pour gérer bordures et murs normaux
  borderRects: Phaser.GameObjects.Rectangle[] = [];
  itemRects: Phaser.GameObjects.Rectangle[] = [];

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

  /**
   * Met à jour l'affichage des murs
   * @param wallsState : bordures fixes
   * @param snakeWalls : tous les murs posés par les snakes (items)
   */
  update(wallsState: WallsState, snakeWalls: SnakeWallsState[] = []) {
    // --- Bordures ---
    const borders = wallsState.borders || [];
    while (this.borderRects.length > borders.length) {
      this.borderRects.pop()?.destroy();
    }
    while (this.borderRects.length < borders.length) {
      const rect = this.scene.add.rectangle(
        0,
        0,
        this.PIXEL_SIZE,
        this.PIXEL_SIZE,
        0xff0000 // rouge pour les bordures
      );
      this.borderRects.push(rect);
    }
    borders.forEach((wall, i) => {
      const pos = this.gridToPixels(wall);
      this.borderRects[i].setPosition(pos.x, pos.y);
    });

    // --- Murs normaux (de tous les snakes) ---
    const items: GridPos[] = [];
    snakeWalls.forEach(sw => {
      items.push(...(sw.items || []));
    });

    while (this.itemRects.length > items.length) {
      this.itemRects.pop()?.destroy();
    }
    while (this.itemRects.length < items.length) {
      const rect = this.scene.add.rectangle(
        0,
        0,
        this.PIXEL_SIZE,
        this.PIXEL_SIZE,
        0x888888 // gris pour les murs posés
      );
      this.itemRects.push(rect);
    }
    items.forEach((wall, i) => {
      const pos = this.gridToPixels(wall);
      this.itemRects[i].setPosition(pos.x, pos.y);
    });
  }

  resize(pixelSize: number) {
    this.PIXEL_SIZE = pixelSize;
    [...this.borderRects, ...this.itemRects].forEach(rect => {
      rect.setSize(this.PIXEL_SIZE, this.PIXEL_SIZE);
    });
  }
  destroy() {
    this.borderRects.forEach(r => r.destroy());
    this.borderRects = [];

    this.itemRects.forEach(r => r.destroy());
    this.itemRects = [];
  }
}
