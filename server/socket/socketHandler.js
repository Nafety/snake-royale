// server/index.js
const GameRoom = require('../game/GameRoom');
const path = require('path');
const { SKILLS_DB } = require('../skills');

function getFrontGameConfig(gameConfig) {
  return {
    pixelSize: gameConfig.game.pixelSize,
    gridWidth: gameConfig.game.map.width,
    gridHeight: gameConfig.game.map.height,
    paddingX: gameConfig.game.map.paddingX,
    paddingY: gameConfig.game.map.paddingY,
    useSkills: gameConfig.game.useSkills
  };
}

const rooms = {};         // toutes les rooms actives { roomId: GameRoom }
const waitingRooms = {};  // rooms en attente par mode { mode: [GameRoom] }

module.exports = function(io, sessionMiddleware) {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', socket => {
    console.log('🟢 Player connected', socket.id);

    socket.emit('skillsList', SKILLS_DB || {});

    socket.on('joinGame', ({ mode = 'classic', loadout = [] }) => {
      const session = socket.request.session;
      console.log(`Player ${socket.id} requests to join mode: ${mode} with loadout:`, loadout);

      try {
        const configPath = path.join(__dirname, '..', 'configs', `${mode}.js`);
        const gameConfig = require(configPath);

        session.gameMode = mode;
        session.gameConfig = gameConfig;
        const frontConfig = getFrontGameConfig(gameConfig);
        session.save();

        if (!waitingRooms[mode]) waitingRooms[mode] = [];

        // Chercher une room en attente avec de la place
        let room = waitingRooms[mode].find(
          r => !r.started && Object.keys(r.snakes).length < gameConfig.maxPlayers
        );

        // Si aucune room dispo, en créer une
        if (!room) {
          const roomId = `room-${Date.now()}`;
          room = new GameRoom(gameConfig, SKILLS_DB);
          room.id = roomId;
          room.mode = mode; // <-- fix important
          room.started = false;

          waitingRooms[mode].push(room);
          rooms[roomId] = room;

          console.log(`Nouvelle room ${roomId} créée pour mode ${mode}`);
        }

        // Ajouter le joueur avec son loadout
        room.addPlayer(socket.id, loadout);
        socket.join(room.id);

        console.log(`Player ${socket.id} rejoint room ${room.id} (${Object.keys(room.snakes).length}/${gameConfig.maxPlayers})`);

        // ✅ Démarrer la partie si nombre max atteint
        if (Object.keys(room.snakes).length === gameConfig.maxPlayers) {
          room.started = true;

          // Envoyer le start à tous les joueurs avec toutes les infos
          Object.keys(room.snakes).forEach(id => {
            const playerLoadout = room.getPlayerLoadout(id);
            console.log(`Starting game for player ${id}, start : `, { mode: mode, config: frontConfig, playerId: id, skills: room.skills, loadout: playerLoadout });

            io.to(id).emit('start', {
              mode: mode,
              config: frontConfig,
              playerId: id,
              skills: room.skills,
              loadout: playerLoadout
            });
          });

          console.log(`Room ${room.id} démarre la partie, players: ${Object.keys(room.snakes).join(', ')}, mode: ${mode}`);

          // Lancer la boucle serveur
          room.interval = setInterval(() => {
            room.update();

            room.resetThisFrame.forEach(socketId => {
              io.to(socketId).emit('playerReset');
            });

            io.to(room.id).emit('state', room.getState());
          }, room.config.server.tickRate);

          // Retirer de waitingRooms
          waitingRooms[mode] = waitingRooms[mode].filter(r => r !== room);

        } else {
          // Sinon, joueur en attente
          socket.emit('waiting', { roomId: room.id });
        }

      } catch (err) {
        console.error(`Erreur loading config pour le mode ${mode}:`, err);
        socket.emit('error', { message: 'Mode de jeu invalide' });
      }
    });

    // INPUT
    socket.on('input', dir => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (room) room.setInput(socket.id, dir);
    });

    // USE SKILL
    socket.on('useSkill', ({ skill }) => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (!room) return;

      console.log(`Player ${socket.id} tries to use the skill: ${skill}`);
      room.useSkill(socket.id, skill);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (!room) return;

      room.removePlayer(socket.id);
      console.log(`Player ${socket.id} disconnected from room ${room.id}`);

      const mode = room.mode || room.config?.mode || 'classic';

      if (Object.keys(room.snakes).length === 0) {
        clearInterval(room.interval);
        delete rooms[room.id];
        waitingRooms[mode] = waitingRooms[mode]?.filter(r => r !== room) || [];
        console.log(`Room ${room.id} supprimée`);
      } else if (!room.started && !waitingRooms[mode].includes(room)) {
        waitingRooms[mode].push(room);
        console.log(`Room ${room.id} remise en attente`);
      }
    });
  });
};
