export class SnakeRenderer {
  constructor(scene, pixelSize, gridWidth, gridHeight, offsetX = 0, offsetY = 0) {
    this.scene = scene;
    this.snakes = {};
    this.playerSnake = null;
    this.playerBody = [];
    this.apple = null;

    this.PIXEL_SIZE = pixelSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  gridToPixels(gridPos) {
    return {
      x: this.offsetX + gridPos.x * this.PIXEL_SIZE + this.PIXEL_SIZE / 2,
      y: this.offsetY + gridPos.y * this.PIXEL_SIZE + this.PIXEL_SIZE / 2
    };
  }

  createPlayerSnake(x, y) {
    const pos = this.gridToPixels({ x, y });
    this.playerSnake = this.scene.add.rectangle(pos.x, pos.y, this.PIXEL_SIZE, this.PIXEL_SIZE, 0x00ff00);
    return this.playerSnake;
  }

  createApple(x, y) {
    const pos = this.gridToPixels({ x, y });
    this.apple = this.scene.add.rectangle(pos.x, pos.y, this.PIXEL_SIZE, this.PIXEL_SIZE, 0xff0000);
    return this.apple;
  }

  updateApple(x, y) {
    if (!this.apple) return;
    const pos = this.gridToPixels({ x, y });
    this.apple.setPosition(pos.x, pos.y);
  }

  updatePlayerBody(body) {
    if (!this.playerSnake) return;

    while (this.playerBody.length < body.length - 1) {
      const seg = this.scene.add.rectangle(0, 0, this.PIXEL_SIZE - 4, this.PIXEL_SIZE - 4, 0x00cc00);
      this.playerBody.push(seg);
    }
    while (this.playerBody.length > body.length - 1) {
      this.playerBody.pop().destroy();
    }

    for (let i = 0; i < body.length - 1; i++) {
      const pos = this.gridToPixels(body[i]);
      this.playerBody[i].setPosition(pos.x, pos.y);
    }

    const headPos = this.gridToPixels(body[body.length - 1]);
    this.playerSnake.setPosition(headPos.x, headPos.y);
  }

  updateOtherSnakes(snakesData, myId) {
    for (const id in snakesData) {
      if (id === myId) continue;
      const body = snakesData[id].body;
      if (!this.snakes[id]) this.snakes[id] = [];

      while (this.snakes[id].length < body.length) {
        const seg = this.scene.add.rectangle(0, 0, this.PIXEL_SIZE, this.PIXEL_SIZE, 0x0000ff);
        this.snakes[id].push(seg);
      }
      while (this.snakes[id].length > body.length) {
        this.snakes[id].pop().destroy();
      }

      for (let i = 0; i < body.length; i++) {
        const pos = this.gridToPixels(body[i]);
        this.snakes[id][i].setPosition(pos.x, pos.y);
      }
    }
  }

  updatePixelSize(newPixelSize, offsetX = null, offsetY = null) {
    this.PIXEL_SIZE = newPixelSize;
    if (offsetX !== null) this.offsetX = offsetX;
    if (offsetY !== null) this.offsetY = offsetY;
  }

  redraw(snakesData, apple) {
    if (this.playerSnake && this.playerBody.length && snakesData[this.scene.playerId]) {
      const playerBody = snakesData[this.scene.playerId].body;
      for (let i = 0; i < this.playerBody.length; i++) {
        const pos = this.gridToPixels(playerBody[i]);
        this.playerBody[i].setPosition(pos.x, pos.y);
      }
      const headPos = this.gridToPixels(playerBody[playerBody.length - 1]);
      this.playerSnake.setPosition(headPos.x, headPos.y);
    }

    for (const id in snakesData) {
      if (id === this.scene.playerId) continue;
      const body = snakesData[id].body;
      if (!this.snakes[id]) continue;
      for (let i = 0; i < body.length; i++) {
        const pos = this.gridToPixels(body[i]);
        this.snakes[id][i].setPosition(pos.x, pos.y);
      }
    }

    if (apple) this.updateApple(apple.x, apple.y);
  }
}