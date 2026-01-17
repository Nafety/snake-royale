module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    map: {
      width: 40,      // 40 cellules en grille
      height: 30      // 30 cellules en grille
    },

    snake: {
      startLength: 3,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE (pas pixels)
    }
  },

  maxPlayers: 2,    // nombre de joueurs requis pour démarrer
  mode: 'classic'   // identifiant du mode de jeu
};
