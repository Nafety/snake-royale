// server/WaitingRoom.js
class WaitingRoom {
  constructor(config, skillsDB) {
    this.config = config;
    this.skills = skillsDB;

    // joueurs présents dans la salle
    this.players = new Set();

    // { socketId: ['dash', 'freeze'] }
    this.playerLayouts = {};
  }

  // ================================
  // JOUEURS
  // ================================
  addPlayer(socketId) {
    this.players.add(socketId);
    this.playerLayouts[socketId] = [];
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    delete this.playerLayouts[socketId];
  }

  // ================================
  // LAYOUT / SKILLS
  // ================================
  getLayout(playerId) {
    return {
      choices: Object.entries(this.skills),
      selected: this.playerLayouts[playerId] || []
    };
  }

  setLayout(playerId, selectedSkills) {
    const validSkills = Object.keys(this.skills);

    this.playerLayouts[playerId] = selectedSkills
      .filter(s => validSkills.includes(s))
      .slice(0, this.config.game.maxSkills);
  }

  getPlayerLoadout(playerId) {
    return this.playerLayouts[playerId] || [];
  }

  /**
   * Données finales pour créer une partie
   */
  exportGameData() {
    return {
      players: Array.from(this.players),
      layouts: this.playerLayouts
    };
  }
}

module.exports = WaitingRoom;
