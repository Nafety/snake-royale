const socket = io();

// Config Phaser
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  backgroundColor: '#111',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let playerSnake;
let cursors;
let snakes = {}; // tous les snakes (y compris adversaires)

function preload() {
  // si on a des sprites plus tard
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  // Snake local
  playerSnake = this.add.rectangle(200, 200, 20, 20, 0x00ff00);
  snakes['me'] = playerSnake;

  // Réception de l’état initial depuis le serveur
  socket.on('init', ({ snake }) => {
    playerSnake.x = snake.x;
    playerSnake.y = snake.y;
  });

  // Réception mouvements adversaires
  socket.on('opponentMove', ({ id, snake }) => {
    if (!snakes[id]) {
      snakes[id] = game.scene.scenes[0].add.rectangle(snake.x, snake.y, 20, 20, 0xff0000);
    } else {
      snakes[id].x = snake.x;
      snakes[id].y = snake.y;
    }
  });

  socket.on('playerLeft', ({ id }) => {
    if (snakes[id]) {
      snakes[id].destroy();
      delete snakes[id];
    }
  });
}

function update() {
  let moved = false;

  if (cursors.left.isDown) { playerSnake.x -= 2; moved = true; }
  if (cursors.right.isDown) { playerSnake.x += 2; moved = true; }
  if (cursors.up.isDown) { playerSnake.y -= 2; moved = true; }
  if (cursors.down.isDown) { playerSnake.y += 2; moved = true; }

  // Envoi position au serveur si bougé
  if (moved) {
    socket.emit('move', { x: playerSnake.x, y: playerSnake.y });
  }
}
