module.exports = {
  server: {
    tickRate: 100
  },

  game: {
    pixelSize: 50,
    map: {
      width: 60,      // 40 cellules en grille
      height: 30,
    },
    useSkills: true,
    isTeleportationAllowed: true,
    snake: {
      startLength: 3,
      respawnAfterDeath: true,
      dammageOnCollision: false,
      dammageCollision: 1,
      inversionAllowed: false,
      selfCollision: true,
      startPos: { x: 10, y: 10 }  // coordonnées GRILLE (pas pixels)
    },
  },
  maxPlayers: 2,    // nombre de joueurs requis pour démarrer
  mode: 'classic'   // identifiant du mode de jeu
};
