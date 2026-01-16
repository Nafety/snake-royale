const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Servir le frontend
app.use(express.static('public'));

// Stockage minimal de snake (exemple)
let snakes = {};

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Crée un snake pour ce joueur
  snakes[socket.id] = { x: 200, y: 200 };

  // Envoie l’état initial du snake
  socket.emit('init', { snake: snakes[socket.id] });

  // Recevoir les mouvements
  socket.on('move', (data) => {
    // Mettre à jour la position côté serveur
    if (snakes[socket.id]) {
      snakes[socket.id].x = data.x;
      snakes[socket.id].y = data.y;
    }
    // Envoyer à tous les autres joueurs
    socket.broadcast.emit('opponentMove', { id: socket.id, snake: snakes[socket.id] });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete snakes[socket.id];
    socket.broadcast.emit('playerLeft', { id: socket.id });
  });
});

// Démarrer serveur
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
