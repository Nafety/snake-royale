// server/Game.js
class Game {
  constructor(config) {
    if (new.target === Game) throw new Error('Game is abstract');
    this.config = config;
    this.id = null;     // id de la partie
    this.mode = null;   // mode du jeu
    this.interval = null;
  }

  /** Initialiser le jeu avec les données de la waiting room */
  init(gameData) {
    throw new Error('init() not implemented');
  }

  /** Recevoir un input */
  setInput(playerId, input) {
    throw new Error('setInput() not implemented');
  }

  /** Utiliser un skill */
  useSkill(playerId, skill, targetId = null) {
    throw new Error('useSkill() not implemented');
  }

  /** Update du jeu (game loop) */
  update() {
    throw new Error('update() not implemented');
  }

  /** État public à envoyer au client */
  getState() {
    throw new Error('getState() not implemented');
  }

  /** Nettoyer la partie */
  destroy() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = Game;
