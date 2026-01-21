import { MusicProvider } from "./components/MusicProvider";
import GameManager from "./components/GameManager";

export default function App() {
  return (
    <MusicProvider>
      <div
        id="phaser-root"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />
      <GameManager />
    </MusicProvider>
  );
}
