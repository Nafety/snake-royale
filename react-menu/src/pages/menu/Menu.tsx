import { useEffect, useState } from "react";
import { Button, Card, ProgressBar } from "pixel-retroui";
import { useMusic } from "../../components/MusicProvider";
import { socketManager } from "../../phaser/socket/SocketManager";
import type { GameInitData, Skill } from "../../phaser/PhaserGame";
import "pixel-retroui/dist/index.css";
import "pixel-retroui/dist/fonts.css";

const MAX_SKILLS = 3;

type MenuProps = {
  onStart: (data: GameInitData) => void;
};

export default function Menu({ onStart }: MenuProps) {
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playMusic } = useMusic();

  useEffect(() => {
    playMusic("/assets/music/menu-theme.mp3", { loop: true, volume: 0.4 });

    socketManager.on("skillsList", (data: Record<string, Skill>) => {
      setSkills(data);
      setSelected(new Set(Object.keys(data)));
    });

    socketManager.on("waiting", () => {
      setWaiting(true);
    });

    socketManager.on("start", (gameData: GameInitData) => {
      setWaiting(false);
      setProgress(0);
      onStart(gameData); // <-- App gère le lancement de Phaser
    });

    socketManager.on("connect_error", () => {
      setError("Impossible de se connecter au serveur");
    });
  }, [playMusic, onStart]);

  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 100);
    return () => clearInterval(interval);
  }, [waiting]);

  const toggleSkill = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else if (copy.size < MAX_SKILLS) copy.add(id);
      return copy;
    });
  };

  const startGame = (mode: string) => {
    socketManager.emit("joinGame", { mode, loadout: [...selected] });
    setWaiting(true);
  };

  if (waiting) {
    return (
      <div className="font-minecraft" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        padding: 20,
      }}>
        <p style={{ color: "#00ffcc", marginBottom: 10 }}>Recherche en cours…</p>
        <div style={{ width: 300 }}>
          <ProgressBar size="lg" color="black" borderColor="white" progress={progress} className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="font-minecraft" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: "#111",
      boxSizing: "border-box",
    }}>
      <h1 style={{ fontSize: "2rem", color: "#ffdd55", marginBottom: "1rem" }}>🐍 Snake Royale</h1>
      <p style={{ fontSize: "1rem", color: "#00ffcc", marginBottom: "1.5rem", textAlign: "center" }}>
        Choisis jusqu’à {MAX_SKILLS} compétences
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", marginBottom: "2rem" }}>
        <Button onClick={() => startGame("classic")} bg="black" textColor="white" borderColor="white" shadow="white">Classic</Button>
        <Button onClick={() => startGame("deathmatch")} bg="black" textColor="white" borderColor="white" shadow="white">Deathmatch</Button>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "2rem",
        width: "100%",
        maxWidth: "700px",
      }}>
        {Object.entries(skills).map(([id, skill]) => (
          <Card key={id}
            onClick={() => toggleSkill(id)}
            bg={selected.has(id) ? "lightgreen" : "darkgray"}
            textColor={selected.has(id) ? "black" : "white"}
            borderColor="white"
            shadowColor="white"
            className="font-minecraft"
            style={{ flex: "0 0 150px", padding: 8, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
          >
            <h2 style={{ margin: 0 }}>{id.toUpperCase()}</h2>
            <p style={{ fontSize: 12, margin: 0 }}>Key: {skill.bind}</p>
          </Card>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
