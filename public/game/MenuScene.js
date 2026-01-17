export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 50, 'Choisissez un mode de jeu', {
      fontSize: '28px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Bouton Classic
    const classicBtn = this.add.text(width / 2, height / 2, 'Classic', {
      fontSize: '32px',
      fill: '#0f0'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { mode: 'classic' });
      });

    // Bouton Deathmatch
    const deathmatchBtn = this.add.text(width / 2, height / 2 + 60, 'Deathmatch', {
      fontSize: '32px',
      fill: '#f00'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { mode: 'deathmatch' });
      });
  }
}
