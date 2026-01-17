// server/socket/socketHandler.js
const GameRoom = require('../game/GameRoom');
const path = require('path');

const rooms = {}; // toutes les rooms actives { roomId: GameRoom }
const waitingRooms = {}; // rooms en attente par mode { mode: GameRoom }

module.exports = function(io, sessionMiddleware) {
  // Partager la session avec Socket.IO
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', socket => {
    console.log('🟢 Player connected', socket.id);

    // ================= JOIN GAME =================
    socket.on('joinGame', (mode = 'classic') => {
      const session = socket.request.session;

      // Charger la config du mode
      try {
        const configPath = path.join(__dirname, '..', 'configs', `${mode}.js`);
        const gameConfig = require(configPath);

        session.gameMode = mode;
        session.gameConfig = gameConfig;
        session.save();

        console.log(`Player ${socket.id} joined mode: ${mode}`);

        let room;

        // Vérifier s'il y a une room en attente pour ce mode
        if (waitingRooms[mode] && !waitingRooms[mode].started) {
          room = waitingRooms[mode];
          room.addPlayer(socket.id);
          socket.join(room.id);

          room.started = true;
          waitingRooms[mode] = null;

          // Prévenir tous les joueurs que la partie démarre
          Object.keys(room.snakes).forEach(id => {
            io.to(id).emit('start', {
              playerId: id,
              config: room.config
            });
          });

          // Lancer la game loop
          room.interval = setInterval(() => {
            room.update();
            io.to(room.id).emit('state', room.getState());
          }, room.config.server.tickRate);

        } else {
          // Créer une nouvelle room et la mettre en attente
          const roomId = `room-${Date.now()}`;
          room = new GameRoom(gameConfig);
          room.config = gameConfig;
          room.id = roomId;
          room.started = false;

          room.addPlayer(socket.id);
          socket.join(room.id);

          rooms[roomId] = room;
          waitingRooms[mode] = room;

          // Envoyer uniquement l'id + config au joueur
          socket.emit('start', {
            playerId: socket.id,
            config: room.config
          });
        }

      } catch (err) {
        console.error(`Erreur loading config pour le mode ${mode}:`, err);
        socket.emit('error', { message: 'Mode de jeu invalide' });
      }
    });

    // ================= INPUT =================
    socket.on('input', dir => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (room) room.setInput(socket.id, dir);
    });

    // ================= DISCONNECT =================
    socket.on('disconnect', () => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (!room) return;

      room.removePlayer(socket.id);

      // Si plus personne, supprimer la room
      if (Object.keys(room.snakes).length === 0) {
        clearInterval(room.interval);
        delete rooms[room.id];
        if (waitingRooms[room.config.mode] === room) waitingRooms[room.config.mode] = null;
        console.log(`Room ${room.id} supprimée`);
      } 
      // Si un seul joueur reste, remettre la room en attente
      else if (room.started && Object.keys(room.snakes).length === 1) {
        clearInterval(room.interval);
        room.started = false;
        waitingRooms[room.config.mode] = room;
        console.log(`Room ${room.id} remise en attente`);
      }
    });
  });
};
