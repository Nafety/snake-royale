module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    pixelSize: 20,    // chaque cellule grille = 20px (pour conversion frontend)
    map: {
      width: 40,      // 40 cellules en grille
      height: 30      // 30 cellules en grille
    },

    snake: {
      startLength: 3,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE au lieu de pixels
    }
  }
};
