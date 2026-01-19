const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

const setupSockets = require('./socket/socketHandler');
const PORT = 3000;
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

const configurationRouter = require('./routes/configuration');
app.use("/api/config", configurationRouter);

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
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

//server.listen(PORT, '0.0.0.0', () => {
//  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
//});