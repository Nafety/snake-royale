module.exports = {
  server: {
    tickRate: 100
  },

  game: {
    pixelSize: 50,
    map: {
      width: 60,      // 40 cellules en grille
      height: 30,
      paddingX: 50,    // total gauche + droite
      paddingY: 50   // total haut + bas
    },
    useSkills: false,
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

  maxPlayers: 2,    // nombre de joueurs requis pour démarrer
  mode: 'deathmatch'   // identifiant du mode de jeu
};
