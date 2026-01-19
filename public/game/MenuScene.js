import { socketManager } from '../socket/SocketManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });

    this.skills = {};       // compétences reçues du serveur
    this.selectedSkills = new Set();
    this.maxSkills = 3;
    this.mode = null;
    this.config = null;
  }

  create() {
    const { width, height } = this.scale;

    // ===== TITRE =====
    this.add.text(width / 2, 50, 'Snake Royale', {
      fontSize: '36px',
      fill: '#fff'
    }).setOrigin(0.5);

    // ===== BOUTONS MODE =====
    this.createModeButton(width / 2, 150, 'Classic', 'classic');
    this.createModeButton(width / 2, 220, 'Deathmatch', 'deathmatch');

    // ===== RÉCEPTION SKILLS =====
    socketManager.on('skillsList', (skills) => {
      console.log('Skills reçus du serveur:', skills);
      this.skills = skills;
      this.showSkillsSelection();
    });
  }

  // ===== CREATION BOUTONS MODE =====
  createModeButton(x, y, label, mode) {
    this.add.text(x, y, label, {
      fontSize: '28px',
      fill: '#0f0'
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.loadConfigAndStart(mode));
  }

  // ===== CHARGER LA CONFIG ET LANCER LA SCÈNE =====
  async loadConfigAndStart(mode) {
    this.mode = mode;

    try {
      const res = await fetch(`/api/config/${mode}`);
      const data = await res.json();
      if (!data.ok) return alert("Mode de jeu invalide");

      this.config = data.frontConfig;

      // ✅ Lancer GameScene avec le mode, config et loadout choisi
      const loadout = [...this.selectedSkills]; // peut être vide si rien sélectionné
      console.log('Démarrage GameScene avec loadout:', loadout);
      this.scene.start('GameScene', {
        mode: this.mode,
        config: this.config,
        loadout: loadout
      });

    } catch (err) {
      console.error("Erreur en chargeant la config :", err);
      alert("Impossible de charger la config du jeu");
    }
  }

  // ===== AFFICHAGE SELECTION SKILLS =====
  showSkillsSelection() {
    const { width } = this.scale;

    // 🔹 Sélectionner par défaut toutes les compétences reçues
    this.selectedSkills = new Set(Object.keys(this.skills));

    // Titre
    this.add.text(width / 2, 300, `Choisissez jusqu'à ${this.maxSkills} compétences`, {
      fontSize: '22px',
      fill: '#fff'
    }).setOrigin(0.5);

    let xStart = width / 2 - 150;
    let y = 360;
    let index = 0;

    for (const [id, skill] of Object.entries(this.skills)) {
      const card = this.createSkillCard(xStart + index * 160, y, id, skill);

      // Mettre la carte en vert si elle est dans selectedSkills
      if (this.selectedSkills.has(id)) {
        card.setFillStyle(0x006600);
      }

      index++;
    }
  }


  createSkillCard(x, y, id, skill) {
    const card = this.add.rectangle(x, y, 140, 80, 0x333333)
      .setInteractive();

    this.add.text(x, y - 10, id.toUpperCase(), {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.add.text(x, y + 15, `Key: ${skill.bind}`, {
      fontSize: '14px',
      fill: '#aaa'
    }).setOrigin(0.5);

    card.on('pointerdown', () => {
      if (this.selectedSkills.has(id)) {
        this.selectedSkills.delete(id);
        card.setFillStyle(0x333333);
      } else {
        if (this.selectedSkills.size >= this.maxSkills) return;
        this.selectedSkills.add(id);
        card.setFillStyle(0x006600);
      }
    });

    return card; // 🔹 Permet de le colorier si besoin
  }

}
