import { GameScene } from './game/GameScene.js';

console.log('🚀 App.js chargé');

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111',
  scene: GameScene
});
