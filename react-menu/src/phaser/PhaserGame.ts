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

export function launchPhaser(initData: GameInitData) {
  if (game) {
    console.warn("Game déjà lancé !");
    return;
  }

  const phaserRoot = document.getElementById("phaser-root");
  if (!phaserRoot) {
    console.error("Div #phaser-root introuvable !");
    return;
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: phaserRoot,
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#000000",
  });

  game.scene.start("GameScene", initData);
}
