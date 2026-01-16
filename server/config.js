module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    gridSize: 20,
    map: {
      width: 40,   // 40 * 20 = 800px
      height: 30   // 30 * 20 = 600px
    },

    snake: {
      startLength: 3,
      startPos: { x: 200, y: 200 }
    }
  }
};
