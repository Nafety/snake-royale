// skillsDB.js
export const SKILLS_DB = {
  dash: {
    bind: 'A',
    cost: 1,
    numberOfCells: 5,
    cooldownMs: 5000,
  },
  freeze: {
    bind: 'Z',
    cost: 2,
    durationMs: 3000,
    cooldownMs: 8000,
  },
  wall: {
    bind: 'E',
    cost: 3,
    distanceCells: 10,
    numberOfCells: 3,
    durationMs: 5000,
    cooldownMs: 10000,
  },
};
