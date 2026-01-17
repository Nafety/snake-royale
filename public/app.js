import { MenuScene } from './game/MenuScene.js';
import { GameScene } from './game/GameScene.js';
import { clientConfig } from './config.js';

console.log('🚀 App.js chargé');

const gameWidth = clientConfig.game.map.width * clientConfig.game.pixelSize;
const gameHeight = clientConfig.game.map.height * clientConfig.game.pixelSize;

new Phaser.Game({
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  backgroundColor: '#111',
  scene: [MenuScene, GameScene], 
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});
