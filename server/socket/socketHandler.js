const path = require('path');
const { SKILLS_DB } = require('../skills');

// jeux disponibles
const SnakeGame = require('../games/SnakeGame');
const GameClasses = {
  classic: SnakeGame,
  deathmatch: SnakeGame,
  // tetris: TetrisGame, ...
};

const WaitingRoom = require('../games/WaitingRoom');

function getFrontGameConfig(gameConfig) {
  return {
    pixelSize: gameConfig.game.pixelSize,
    gridWidth: gameConfig.game.map.width,
    gridHeight: gameConfig.game.map.height,
    useSkills: gameConfig.game.useSkills
  };
}

const games = {};        // { gameId: Game }
const waitingRooms = {}; // { mode: [WaitingRoom] }

module.exports = function(io, sessionMiddleware) {
  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

  io.on('connection', socket => {
    console.log('🟢 Player connected', socket.id);

    // --------------------------
    // MENU
    // --------------------------
    socket.on('enterMenu', () => {
      console.log(`📦 Player ${socket.id} enters menu`);
      socket.emit('skillsList', SKILLS_DB || {});
    });

    // --------------------------
    // JOIN GAME
    // --------------------------
    socket.on('joinGame', ({ mode = 'classic', loadout = [] }) => {
      console.log(`🎮 Player ${socket.id} requests joinGame`, { mode, loadout });

      // Vérifier si déjà dans une game
      const alreadyInGame = Object.values(games).find(g => g.snakes?.[socket.id]);
      if (alreadyInGame) {
        console.warn(`⚠️ Player ${socket.id} already in a game`);
        return;
      }

      try {
        const configPath = path.join(__dirname, '..', 'configs', `${mode}.js`);
        const gameConfig = require(configPath);
        const frontConfig = getFrontGameConfig(gameConfig);

        if (!waitingRooms[mode]) waitingRooms[mode] = [];

        // Chercher une waiting room dispo
        let room = waitingRooms[mode].find(r => r.players.size < gameConfig.maxPlayers);

        if (!room) {
          room = new WaitingRoom(gameConfig, SKILLS_DB);
          room.id = `room-${Date.now()}`;
          room.mode = mode;
          waitingRooms[mode].push(room);
          console.log(`🆕 WaitingRoom ${room.id} created for mode ${mode}`);
        }

        // Ajouter le joueur à la waiting room
        room.addPlayer(socket.id);
        room.setLayout(socket.id, loadout);
        socket.join(room.id);

        console.log(`👤 Player ${socket.id} joined WaitingRoom ${room.id} (${room.players.size}/${gameConfig.maxPlayers})`);

        // Démarrer la partie si full
        if (room.players.size === gameConfig.maxPlayers) {
          console.log(`🚀 WaitingRoom ${room.id} is full → starting game`);
          const gameData = room.exportGameData();

          const GameClass = GameClasses[mode];
          if (!GameClass) throw new Error(`Game class for mode "${mode}" not found`);

          const game = new GameClass(gameConfig, SKILLS_DB);
          game.init(gameData);
          game.id = room.id;
          game.mode = mode;

          // Stocker la game
          games[game.id] = game;

          // Retirer la waiting room
          waitingRooms[mode] = waitingRooms[mode].filter(r => r !== room);

          // Démarrer le jeu côté client
          gameData.players.forEach(playerId => {
            io.to(playerId).emit('start', {
              mode,
              config: frontConfig,
              playerId,
              skills: SKILLS_DB,
              loadout: gameData.layouts[playerId]
            });
          });

          // --------------------------
          // Game loop générique
          // --------------------------
          game.interval = setInterval(() => {
            game.update();

            // Stopper la partie si plus de snakes
            if (Object.keys(game.snakes).length === 0) {
              console.log(`🏁 Game ${game.id} finished (all players left)`);
              clearInterval(game.interval);
              delete games[game.id];
              io.to(game.id).emit('stopped');
              return;
            }

            io.to(game.id).emit('state', game.getState());
          }, gameConfig.server.tickRate);

          console.log(`🎯 Game ${game.id} started`);
        } else {
          socket.emit('waiting', { roomId: room.id });
        }
      } catch (err) {
        console.error(`❌ Error loading config for mode ${mode}`, err);
        socket.emit('error', { message: 'Invalid game mode' });
      }
    });

    // --------------------------
    // INPUT / SKILLS
    // --------------------------
    socket.on('input', input => {
      const game = Object.values(games).find(g => g.snakes?.[socket.id]);
      if (!game || typeof game.setInput !== 'function') return;
      game.setInput(socket.id, input);
    });

    socket.on('useSkill', ({ skill, targetId }) => {
      const game = Object.values(games).find(g => g.snakes?.[socket.id]);
      if (!game || typeof game.useSkill !== 'function') return;
      game.useSkill(socket.id, skill, targetId);
    });

    // --------------------------
    // LEAVE GAME
    // --------------------------
    socket.on('leaveGame', () => {
      const game = Object.values(games).find(g => g.snakes?.[socket.id]);
      if (!game) return;

      delete game.snakes[socket.id];
      socket.leave(game.id);

      if (Object.keys(game.snakes).length === 0) {
        console.log(`🗑️ Game ${game.id} finished (all players left)`);
        clearInterval(game.interval);
        delete games[game.id];
        io.to(game.id).emit('stopped');
      }
    });

    // --------------------------
    // DISCONNECT
    // --------------------------
    socket.on('disconnect', () => {
      console.log(`🔴 Player disconnected ${socket.id}`);

      const game = Object.values(games).find(g => g.snakes?.[socket.id]);
      if (!game) return;

      delete game.snakes[socket.id];
      socket.leave(game.id);

      if (Object.keys(game.snakes).length === 0) {
        console.log(`🗑️ Game ${game.id} finished (all players left)`);
        clearInterval(game.interval);
        delete games[game.id];
        io.to(game.id).emit('stopped');
      }
    });
  });
};
