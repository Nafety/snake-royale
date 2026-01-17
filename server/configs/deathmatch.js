module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    map: {
      width: 10,      // 40 cellules en grille
      height: 10      // 30 cellules en grille
    },

    snake: {
      startLength: 2,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE au lieu de pixels
    }
  }
};
