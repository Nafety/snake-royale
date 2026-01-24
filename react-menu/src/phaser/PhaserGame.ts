import Phaser from "phaser";
import { GameScene } from "./game/GameScene";

let game: Phaser.Game | null = null;

export type Skill = { bind: string };

export type GameInitData = {
  mode: string;
  config: any;
  playerId: string;
  skills: Record<string, Skill>;
  loadout: string[];
};

/**
 * 🚀 Lance une nouvelle instance Phaser
 * (détruit proprement l’ancienne si elle existe)
 */
export function launchPhaser(initData: GameInitData) {
  const phaserRoot = document.getElementById("phaser-root");
  if (!phaserRoot) return;

  // 🔥 Sécurité : s’il reste un game, on le détruit
  if (game) {
    destroyPhaser();
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: phaserRoot,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    antialias: false,
    backgroundColor: "#000000",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [GameScene],
  });

  game.scene.start("GameScene", initData);
}

/**
 * 🧹 Détruit complètement Phaser
 * → déclenche SHUTDOWN des scenes
 */
export function destroyPhaser() {
  if (!game) return;

  game.destroy(true); // 🔥 appelle SHUTDOWN sur les scenes
  game = null;

  const phaserRoot = document.getElementById("phaser-root");
  if (phaserRoot) {
    phaserRoot.innerHTML = "";
  }
}
