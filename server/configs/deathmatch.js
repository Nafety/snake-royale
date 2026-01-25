module.exports = {
  server: {
    tickRate: 100
  },

  game: {
    pixelSize: 50,

    map: {
      width: 60,
      height: 30,
      type: "custom", // types : custom, ascii, borders

      walls: [
        /* =====================
           BORDERS
        ===================== */
        ...Array.from({ length: 60 }, (_, x) => ({ x, y: 0 })),
        ...Array.from({ length: 60 }, (_, x) => ({ x, y: 29 })),
        ...Array.from({ length: 28 }, (_, y) => ({ x: 0, y: y + 1 })),
        ...Array.from({ length: 28 }, (_, y) => ({ x: 59, y: y + 1 })),

        /* =====================
           CENTRAL BLOCK
        ===================== */
        ...Array.from({ length: 10 }, (_, x) => ({ x: 25 + x, y: 14 })),
        ...Array.from({ length: 6 }, (_, y) => ({ x: 29, y: 12 + y })),

        /* =====================
           LEFT ARENA
        ===================== */
        { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
        { x: 12, y: 9 },                     { x: 14, y: 9 },
        { x: 12, y:10 }, { x: 13, y:10 }, { x: 14, y:10 },

        /* =====================
           RIGHT ARENA (sym)
        ===================== */
        { x: 45, y: 8 }, { x: 46, y: 8 }, { x: 47, y: 8 },
        { x: 45, y: 9 },                     { x: 47, y: 9 },
        { x: 45, y:10 }, { x: 46, y:10 }, { x: 47, y:10 },

        /* =====================
           TOP PASSAGES
        ===================== */
        ...Array.from({ length: 6 }, (_, x) => ({ x: 20 + x, y: 5 })),
        ...Array.from({ length: 6 }, (_, x) => ({ x: 34 + x, y: 5 })),

        /* =====================
           BOTTOM PASSAGES
        ===================== */
        ...Array.from({ length: 6 }, (_, x) => ({ x: 20 + x, y: 23 })),
        ...Array.from({ length: 6 }, (_, x) => ({ x: 34 + x, y: 23 })),
      ]
    },

    useSkills: false,
    isTeleportationAllowed: false,

    snake: {
      startLength: 3,
      respawnAfterDeath: true,
      dammageOnCollision: false,
      dammageCollision: 1,
      inversionAllowed: false,
      selfCollision: true,

      // spawn centré gauche
      startPos: { x: 15, y: 15 }
    }
  },

  maxPlayers: 2,
  mode: "deathmatch"
};
