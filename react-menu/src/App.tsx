import { useEffect, useState } from "react";
import Menu from "./pages/menu/Menu";
import { MusicProvider } from "./components/MusicProvider";
import {
  launchPhaser,
  destroyPhaser,
  type GameInitData,
} from "./phaser/PhaserGame";

export default function App() {
  const [gameData, setGameData] = useState<GameInitData | null>(null);

  const startGame = (data: GameInitData) => {
    setGameData(data);
  };

  const quitGame = () => {
    setGameData(null);
  };

  // 🔥 bridge React → Phaser
  useEffect(() => {
    if (gameData) {
      launchPhaser(gameData);
    } else {
      destroyPhaser();
    }

    return () => {
      destroyPhaser();
    };
  }, [gameData]);

  return (
    <MusicProvider>
      {/* Phaser container */}
      <div
        id="phaser-root"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* React UI */}
      {!gameData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
          }}
        >
          <Menu onStart={startGame} />
        </div>
      )}

      {/* exemple bouton quitter */}
      {gameData && (
        <button
          style={{ position: "absolute", zIndex: 20, top: 20, left: 20 }}
          onClick={quitGame}
        >
          Quitter
        </button>
      )}
    </MusicProvider>
  );
}
