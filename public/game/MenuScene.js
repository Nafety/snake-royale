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

    // Fonction générique pour lancer une partie
    const startGame = async (mode) => {
      try {
        const res = await fetch(`/api/config/${mode}`);
        const data = await res.json();
        if (!data.ok) return alert("Mode de jeu invalide");

        // Lancer la scène avec la config déjà chargée
        this.scene.start('GameScene', { mode, config: data.frontConfig });
      } catch (err) {
        console.error("Erreur en chargeant la config :", err);
        alert("Impossible de charger la config du jeu");
      }
    };

    // Bouton Classic
    const classicBtn = this.add.text(width / 2, height / 2, 'Classic', {
      fontSize: '32px',
      fill: '#0f0'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => startGame('classic'));

    // Bouton Deathmatch
    const deathmatchBtn = this.add.text(width / 2, height / 2 + 60, 'Deathmatch', {
      fontSize: '32px',
      fill: '#f00'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => startGame('deathmatch'));
  }
}
