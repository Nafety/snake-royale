import { MenuScene } from './game/MenuScene.js';
import { GameScene } from './game/GameScene.js';

console.log('🚀 App.js chargé');

new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#140d08',
  scene: [MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});

