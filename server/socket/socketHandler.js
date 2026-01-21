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

const rooms = {};         // { roomId: GameRoom }
const waitingRooms = {};  // { mode: [GameRoom] }

module.exports = function (io, sessionMiddleware) {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', socket => {
    console.log('🟢 Player connected', socket.id);

    /* =========================
       MENU
    ========================= */

    socket.on('enterMenu', () => {
      console.log(`📦 Player ${socket.id} enters menu`);
      socket.emit('skillsList', SKILLS_DB || {});
    });

    /* =========================
       JOIN GAME
    ========================= */

    socket.on('joinGame', ({ mode = 'classic', loadout = [] }) => {
      console.log(
        `🎮 Player ${socket.id} requests joinGame`,
        { mode, loadout }
      );

      // 🔒 sécurité : déjà dans une room ?
      const alreadyInRoom = Object.values(rooms).find(
        r => r.snakes[socket.id]
      );
      if (alreadyInRoom) {
        console.warn(`⚠️ Player ${socket.id} already in a room`);
        return;
      }

      try {
        const configPath = path.join(
          __dirname,
          '..',
          'configs',
          `${mode}.js`
        );
        const gameConfig = require(configPath);

        const session = socket.request.session;
        session.gameMode = mode;
        session.gameConfig = gameConfig;
        session.save();

        const frontConfig = getFrontGameConfig(gameConfig);

        if (!waitingRooms[mode]) waitingRooms[mode] = [];

        // Chercher une room en attente
        let room = waitingRooms[mode].find(
          r => !r.started &&
            Object.keys(r.snakes).length < gameConfig.maxPlayers
        );

        // Créer une room si besoin
        if (!room) {
          const roomId = `room-${Date.now()}`;

          room = new GameRoom(gameConfig, SKILLS_DB);
          room.id = roomId;
          room.mode = mode;
          room.started = false;

          waitingRooms[mode].push(room);
          rooms[roomId] = room;

          console.log(`🆕 Room ${roomId} created for mode ${mode}`);
        }

        // Ajouter le joueur
        room.addPlayer(socket.id, loadout);
        socket.join(room.id);

        console.log(
          `👤 Player ${socket.id} joined room ${room.id} ` +
          `(${Object.keys(room.snakes).length}/${gameConfig.maxPlayers})`
        );

        // Démarrer la partie si room complète
        if (Object.keys(room.snakes).length === gameConfig.maxPlayers) {
          room.started = true;

          Object.keys(room.snakes).forEach(playerId => {
            const playerLoadout = room.getPlayerLoadout(playerId);

            io.to(playerId).emit('start', {
              mode,
              config: frontConfig,
              playerId,
              skills: room.skills,
              loadout: playerLoadout
            });
          });

          console.log(
            `🚀 Room ${room.id} started with players:`,
            Object.keys(room.snakes)
          );

          room.interval = setInterval(() => {
            room.update();

            room.resetThisFrame.forEach(socketId => {
              io.to(socketId).emit('playerReset');
            });

            io.to(room.id).emit('state', room.getState());
          }, room.config.server.tickRate);

          // retirer de la file d'attente
          waitingRooms[mode] = waitingRooms[mode].filter(r => r !== room);
        } else {
          socket.emit('waiting', { roomId: room.id });
        }

      } catch (err) {
        console.error(`❌ Error loading config for mode ${mode}`, err);
        socket.emit('error', { message: 'Invalid game mode' });
      }
    });

    /* =========================
       LEAVE GAME (retour menu)
    ========================= */

    socket.on('leaveGame', () => {
      const room = Object.values(rooms).find(
        r => r.snakes[socket.id]
      );
      if (!room) return;

      console.log(`🚪 Player ${socket.id} leaves room ${room.id}`);

      room.removePlayer(socket.id);
      socket.leave(room.id);

      const mode = room.mode || 'classic';

      if (Object.keys(room.snakes).length === 0) {
        clearInterval(room.interval);
        delete rooms[room.id];
        waitingRooms[mode] =
          waitingRooms[mode]?.filter(r => r !== room) || [];
        console.log(`🗑️ Room ${room.id} deleted`);
      } else if (!room.started && !waitingRooms[mode].includes(room)) {
        waitingRooms[mode].push(room);
        console.log(`⏳ Room ${room.id} back to waiting`);
      }
    });

    /* =========================
       INPUT / SKILLS
    ========================= */

    socket.on('input', dir => {
      const room = Object.values(rooms).find(
        r => r.snakes[socket.id]
      );
      if (room) room.setInput(socket.id, dir);
    });

    socket.on('useSkill', ({ skill }) => {
      const room = Object.values(rooms).find(
        r => r.snakes[socket.id]
      );
      if (!room) return;

      room.useSkill(socket.id, skill);
    });

    /* =========================
       DISCONNECT (onglet fermé)
    ========================= */

    socket.on('disconnect', () => {
      const room = Object.values(rooms).find(
        r => r.snakes[socket.id]
      );
      if (!room) return;

      room.removePlayer(socket.id);

      const mode = room.mode || 'classic';

      if (Object.keys(room.snakes).length === 0) {
        clearInterval(room.interval);
        delete rooms[room.id];
        waitingRooms[mode] =
          waitingRooms[mode]?.filter(r => r !== room) || [];
      } else if (!room.started && !waitingRooms[mode].includes(room)) {
        waitingRooms[mode].push(room);
      }

      console.log(`🔴 Player disconnected ${socket.id}`);
    });
  });
};
