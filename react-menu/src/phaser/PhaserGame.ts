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
  if (game) return;

  const phaserRoot = document.getElementById("phaser-root");
  if (!phaserRoot) return;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: phaserRoot,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    antialias: false,
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#000000",
  });

  game.scene.start("GameScene", initData);
}

export function destroyPhaser() {
  if (!game) return;

  game.destroy(true); // true = remove canvas + events
  game = null;

  // sécurité : vider le container
  const root = document.getElementById("phaser-root");
  if (root) root.innerHTML = "";
}
