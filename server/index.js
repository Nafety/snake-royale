const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

const setupSockets = require('./socket/socketHandler');
const config = require('./configs/classic');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ================= SESSION =================
const sessionMiddleware = session({
  secret: 'snake-secret-key',   // mets une vraie clé plus tard
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false // true uniquement en HTTPS
  }
});

app.use(sessionMiddleware);

// 👉 partager la session avec socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// ================= STATIC =================
app.use(express.static('public'));

// ================= SOCKETS =================
setupSockets(io, sessionMiddleware);

// ================= SERVER =================
server.listen(config.server.port, () => {
  console.log(`✅ Server running on http://localhost:${config.server.port}`);
});
