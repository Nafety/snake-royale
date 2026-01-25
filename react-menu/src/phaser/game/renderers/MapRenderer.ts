// renderers/MapRenderer.ts
import Phaser from "phaser";

type GridPos = { x: number; y: number };

export class MapRenderer {
  scene: Phaser.Scene;
  pixelSize: number;

  walls: Phaser.GameObjects.Rectangle[] = [];
  rendered = false;

  constructor(scene: Phaser.Scene, pixelSize: number) {
    this.scene = scene;
    this.pixelSize = pixelSize;
  }

  private gridToPixels(p: GridPos) {
    return {
      x: p.x * this.pixelSize + this.pixelSize / 2,
      y: p.y * this.pixelSize + this.pixelSize / 2,
    };
  }

  /**
   * Render UNE SEULE FOIS (murs statiques)
   */
  render(walls: GridPos[]) {
    if (this.rendered) return;
    this.rendered = true;

    walls.forEach(w => {
      const pos = this.gridToPixels(w);
      this.walls.push(
        this.scene.add.rectangle(
          pos.x,
          pos.y,
          this.pixelSize,
          this.pixelSize,
          0x444444
        )
      );
    });
  }

  resize(pixelSize: number) {
    this.pixelSize = pixelSize;
    this.walls.forEach(w => {
      w.setSize(pixelSize, pixelSize);
    });
  }

  destroy() {
    this.walls.forEach(w => w.destroy());
    this.walls = [];
    this.rendered = false;
  }
}
