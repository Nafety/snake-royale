const GameRoom = require('../game/GameRoom');
const config = require('../config');

let waitingRoom = null;
const rooms = {};

module.exports = function(io) {
  io.on('connection', socket => {
    console.log('Player connected', socket.id);

    socket.on('joinGame', () => {
      let room;

      // Si une room est en attente → rejoindre
      if (waitingRoom && !waitingRoom.started) {
        room = waitingRoom;
        room.addPlayer(socket.id);
        socket.join(room.id);

        room.started = true;
        waitingRoom = null;

        // Envoyer start avec les ids des joueurs
        Object.keys(room.snakes).forEach(id => {
          io.to(id).emit('start', { playerId: id });
        });

        // Lancer game loop pour la room
        room.interval = setInterval(() => {
          room.update();
          io.to(room.id).emit('state', room.getState());
        }, config.server.tickRate);

      } else {
        // créer nouvelle room et mettre en attente
        const roomId = `room-${Date.now()}`;
        room = new GameRoom();
        room.id = roomId;
        room.addPlayer(socket.id);
        socket.join(room.id);
        rooms[roomId] = room;

        room.started = false;
        waitingRoom = room;

        // envoyer juste le playerId pour que le client sache qui il est
        socket.emit('start', { playerId: socket.id });
      }
    });

    // Réception de l'input
    socket.on('input', dir => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (room) room.setInput(socket.id, dir);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      const room = Object.values(rooms).find(r => r.snakes[socket.id]);
      if (room) {
        room.removePlayer(socket.id);

        if (Object.keys(room.snakes).length === 0) {
          clearInterval(room.interval);
          delete rooms[room.id];
        } else if (room.started && Object.keys(room.snakes).length === 1) {
          // Si reste un joueur, on remet en attente
          waitingRoom = room;
          room.started = false;
          clearInterval(room.interval);
        }
      }
    });
  });
};
