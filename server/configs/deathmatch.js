module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    map: {
      width: 20,      // 40 cellules en grille
      height: 20      // 30 cellules en grille
    },

    snake: {
      startLength: 3,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE (pas pixels)
    }
  },

  maxPlayers: 3,    // nombre de joueurs requis pour démarrer
  mode: 'deathmatch'   // identifiant du mode de jeu
};
