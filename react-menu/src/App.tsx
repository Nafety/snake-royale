import { useState } from "react";
import Menu from "./pages/menu/Menu";
import { MusicProvider } from "./components/MusicProvider";
import { launchPhaser } from "./phaser/PhaserGame";
import type { GameInitData } from "./phaser/PhaserGame";
export default function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [gameData, setGameData] = useState<GameInitData | null>(null);

  const startGame = (data: GameInitData) => {
    setGameData(data);
    setShowMenu(false); // cache le menu
    launchPhaser(data); // lance Phaser
  };

  return (
    <MusicProvider>
      {/* Phaser root */}
      <div
        id="phaser-root"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      ></div>

      {/* Menu overlay */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Menu onStart={startGame} />
        </div>
      )}
    </MusicProvider>
  );
}
