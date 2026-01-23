// src/phaser/renderers/WallRenderer.ts
import Phaser from "phaser";

export type GridPos = { x: number; y: number };
export type WallData = GridPos[];

export class WallRenderer {
  scene: Phaser.Scene;
  PIXEL_SIZE: number;
  walls: Phaser.GameObjects.Rectangle[] = [];

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

  update(walls: WallData) {
    walls ||= [];

    // Supprimer les murs en trop
    while (this.walls.length > walls.length) {
      this.walls.pop()?.destroy();
    }

    // Créer des murs supplémentaires si nécessaire
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

    // Mettre à jour la position de tous les murs
    walls.forEach((wall, i) => {
      const pos = this.gridToPixels(wall);
      this.walls[i].setPosition(pos.x, pos.y);
    });
  }

  resize(pixelSize: number) {
    this.PIXEL_SIZE = pixelSize;
  }
}
