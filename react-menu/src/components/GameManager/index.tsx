import { useEffect, useState } from "react";
import Menu from "../../pages/menu";
import { socketManager } from "../../phaser/socket/SocketManager";
import {
  launchPhaser,
  destroyPhaser,
  type GameInitData,
} from "../../phaser/PhaserGame";

export default function GameManager() {
  const [gameData, setGameData] = useState<GameInitData | null>(null);

  const startGame = (data: GameInitData) => {
    setGameData(data);
  };

  const quitGame = () => {
    socketManager.emit("leaveGame"); // important pour le serveur
    setGameData(null);
  };

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
    <>
      {!gameData && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <Menu onStart={startGame} />
        </div>
      )}

      {gameData && (
        <button
          style={{
            position: "absolute",
            zIndex: 20,
            top: 20,
            left: 20,
          }}
          onClick={quitGame}
        >
          Quitter
        </button>
      )}
    </>
  );
}
