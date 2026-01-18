module.exports = {
  server: {
    port: 3000,
    tickRate: 100
  },

  game: {
    pixelSize: 50,
    map: {
      width: 10,      // 40 cellules en grille
      height: 10,
      paddingX: 40,    // total gauche + droite
      paddingY: 80   // total haut + bas
    },

    snake: {
      startLength: 3,
      respawnLength: 2,
      respawnAfterDeath: true,
      dammageOnCollision: false,
      dammageCollision: 1,
      inversionAllowed: false,
      selfCollision: true,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE (pas pixels)
    }
  },

  maxPlayers: 3,    // nombre de joueurs requis pour démarrer
  mode: 'deathmatch'   // identifiant du mode de jeu
};
