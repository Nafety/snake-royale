// react-menu/src/phaser/AppleRenderer.ts
import Phaser from "phaser";

type GridPos = { x: number; y: number };

export class AppleRenderer {
  scene: Phaser.Scene;
  PIXEL_SIZE: number;
  apple: Phaser.GameObjects.Rectangle | null = null;

  constructor(
    scene: Phaser.Scene,
    pixelSize: number,
  ) {
    this.scene = scene;
    this.PIXEL_SIZE = pixelSize;
  }

  private gridToPixels(gridPos: GridPos) {
    return {
      x:  gridPos.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y:  gridPos.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
    };
  }

  create(x: number, y: number) {
    const pos = this.gridToPixels({ x, y });
    this.apple = this.scene.add.rectangle(
      pos.x,
      pos.y,
      this.PIXEL_SIZE,
      this.PIXEL_SIZE,
      0xff0000
    );
  }

  update(x: number, y: number) {
    if (!this.apple) return;
    const pos = this.gridToPixels({ x, y });
    this.apple.setPosition(pos.x, pos.y);
  }
}
