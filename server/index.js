const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./socket/socketHandler');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

setupSockets(io);

server.listen(config.server.port, () => {
  console.log(`✅ Server running on http://localhost:${config.server.port}`);
});
