// server/socket/socketHandler.js
const GameRoom = require('../game/GameRoom');
const path = require('path');

const rooms = {}; // toutes les rooms actives { roomId: GameRoom }
const waitingRooms = {}; // rooms en attente par mode { mode: [GameRoom] }

module.exports = function(io, sessionMiddleware) {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', socket => {
    console.log('🟢 Player connected', socket.id);

    socket.on('joinGame', (mode = 'classic') => {
      const session = socket.request.session;

      try {
        const configPath = path.join(__dirname, '..', 'configs', `${mode}.js`);
        const gameConfig = require(configPath);

        session.gameMode = mode;
        session.gameConfig = gameConfig;
        session.save();

        if (!waitingRooms[mode]) waitingRooms[mode] = [];

        // Chercher une room en attente avec de la place
        let room = waitingRooms[mode].find(r => !r.started && Object.keys(r.snakes).length < gameConfig.maxPlayers);

        if (!room) {
          // Créer une nouvelle room si aucune dispo
          const roomId = `room-${Date.now()}`;
          room = new GameRoom(gameConfig);
          room.config = gameConfig;
          room.id = roomId;
          room.started = false;

          waitingRooms[mode].push(room);
          rooms[roomId] = room;

          console.log(`Nouvelle room ${roomId} créée pour mode ${mode}`);
        }

        // Rejoindre la room trouvée
        room.addPlayer(socket.id);
        socket.join(room.id);
        console.log(`Player ${socket.id} rejoint room ${room.id}`);

        // Si la room est maintenant pleine, démarrer
        if (Object.keys(room.snakes).length >= gameConfig.maxPlayers) {
          room.started = true;

          // Prévenir tous les joueurs
          Object.keys(room.snakes).forEach(id => {
            io.to(id).emit('start', {
              playerId: id,
              config: room.config
            });
          });

          // Lancer game loop
          room.interval = setInterval(() => {
            room.update();
            
            // Envoyer les resets aux clients concernés
            room.resetThisFrame.forEach(socketId => {
              io.to(socketId).emit('playerReset');
            });
            
            io.to(room.id).emit('state', room.getState());
          }, room.config.server.tickRate);

          // Retirer la room de la liste d'attente
          waitingRooms[mode] = waitingRooms[mode].filter(r => r !== room);
        } else {
          // Room pas encore pleine → joueur en attente
          socket.emit('waiting', { roomId: room.id });
        }

      } catch (err) {
        console.error(`Erreur loading config pour le mode ${mode}:`, err);
        socket.emit('error', { message: 'Mode de jeu invalide' });
      }
    });+

    // INPUT
    socket.on('input', dir => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (room) room.setInput(socket.id, dir);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (!room) return;

      room.removePlayer(socket.id);
      console.log(`Player ${socket.id} disconnected from room ${room.id}`);

      const mode = room.config.mode;

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
