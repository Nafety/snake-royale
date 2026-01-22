import { useEffect, useState, useRef } from "react";
import { Button, Card, Popup } from "pixel-retroui";
import { useMusic } from "../../components/MusicProvider";
import { socketManager } from "../../phaser/socket/SocketManager";
import type { GameInitData, Skill } from "../../phaser/PhaserGame";
import { themes, type Theme, type ThemeColors } from "../../styles/theme";
import "pixel-retroui/dist/index.css";
import "pixel-retroui/dist/fonts.css";
import WaitingScreen from "../waitingscreen";

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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeName, setThemeName] = useState<Theme>("dark");
  const theme: ThemeColors = themes[themeName];

  const { playMusic, isMuted, setMuted, volume, setVolume } = useMusic();

  const firstMenuRef = useRef(true);

  /* =========================
     MENU LIFECYCLE
  ========================= */
  useEffect(() => {
    if (firstMenuRef.current) {
      socketManager.emit("enterMenu");
      playMusic("/assets/music/menu-theme.mp3", { loop: true, volume: 0.4 });
      firstMenuRef.current = false;
    }

    const onSkills = (data: Record<string, Skill>) => {
      setSkills(data);
      setSelected(new Set(Object.keys(data)));
      setWaiting(false);
      setProgress(0);
    };

    socketManager.on("skillsList", onSkills);
    socketManager.on("waiting", () => setWaiting(true));
    socketManager.on("start", (gameData: GameInitData) => {
      setWaiting(false);
      setProgress(0);
      onStart(gameData);
    });
    socketManager.on("connect_error", () =>
      setError("Impossible de se connecter au serveur")
    );

    return () => {
      socketManager.off("skillsList", onSkills);
      socketManager.off("waiting");
      socketManager.off("start");
      socketManager.off("connect_error");
    };
  }, [onStart, playMusic]);

  /* =========================
     WAITING PROGRESS
  ========================= */
  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(
      () => setProgress(p => (p >= 100 ? 0 : p + 2)),
      100
    );
    return () => clearInterval(interval);
  }, [waiting]);

  /* =========================
     UI ACTIONS
  ========================= */
  const toggleSkill = (id: string) => {
    setSelected(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else if (copy.size < MAX_SKILLS) copy.add(id);
      return copy;
    });
  };

  const startGame = (mode: string) => {
    setWaiting(true);
    socketManager.emit("joinGame", {
      mode,
      loadout: [...selected],
    });
  };

  /* =========================
     WAITING SCREEN
  ========================= */
if (waiting) {
  return (
    <WaitingScreen
      theme={theme}
      progress={progress}
      onCancel={() => setWaiting(false)}
    />
  );
}



  /* =========================
     MENU
  ========================= */
  return (
    <div
      className="font-minecraft"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* TITRE */}
      <h1 style={{ fontSize: "2rem", color: theme.secondary }}>🐍 Snake Royale</h1>
      <p style={{ color: theme.primary, marginBottom: "1.5rem" }}>
        Choisis jusqu’à {MAX_SKILLS} compétences
      </p>

      {/* BOUTONS DE MODE */}
      <div style={{ display: "flex", gap: 20, marginBottom: "2rem" }}>
        <Button
          bg={theme.buttonBg}
          textColor={theme.buttonText}
          borderColor={theme.buttonBorder}
          shadow={theme.buttonShadow}
          onClick={() => startGame("classic")}
        >
          Classic
        </Button>
        <Button
          bg={theme.buttonBg}
          textColor={theme.buttonText}
          borderColor={theme.buttonBorder}
          shadow={theme.buttonShadow}
          onClick={() => startGame("deathmatch")}
        >
          Deathmatch
        </Button>
      </div>

      {/* CARTES DES SKILLS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          maxWidth: 700,
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {Object.entries(skills).map(([id, skill]) => (
          <Card
            key={id}
            onClick={() => toggleSkill(id)}
            bg={selected.has(id) ? theme.cardSelected : theme.cardBg}
            textColor={theme.text}
            borderColor={theme.buttonBorder}
            shadowColor={theme.buttonShadow}
            style={{
              width: 150,
              padding: 8,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <h2>{id.toUpperCase()}</h2>
            <p style={{ fontSize: 12 }}>Key: {skill.bind}</p>
          </Card>
        ))}
      </div>

      {/* BOUTON PARAMÈTRES */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <Button
          onClick={() => setSettingsOpen(true)}
          bg={theme.buttonParameterBg}
          textColor={theme.buttonParameterTextColor}
          borderColor={theme.buttonParameterBorder}
          shadow={theme.buttonParameterShadow}
          style={{ fontSize: 18, padding: "6px 12px", cursor: "pointer" }}
        >
          Paramètres
        </Button>
      </div>

      {/* ⚙️ SETTINGS POPUP */}
      <Popup
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        bg={theme.popupBg}
        baseBg={theme.popupBase}
        textColor={theme.text}
        borderColor={theme.buttonBorder}
      >
        {/* Volume */}
        <div style={{ marginBottom: 12, width: "100%" }}>
          <p>Volume : {Math.round(volume * 100)}%</p>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              outline: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${Math.round(
                volume * 100
              )}%, ${theme.sliderTrack} ${Math.round(volume * 100)}%, ${theme.sliderTrack} 100%)`,
            }}
          />
        </div>

        {/* Bouton couper/activer musique */}
        <Button
          onClick={() => setMuted(!isMuted)}
          bg={theme.buttonParameterBg}
          textColor={theme.buttonParameterTextColor}
          borderColor={theme.buttonParameterBorder}
          shadow={theme.buttonParameterShadow}
        >
          {isMuted ? "🔇 Activer la musique" : "🔊 Couper la musique"}
        </Button>

        {/* Sélecteur de thème */}
        <div style={{ marginTop: 16, justifyContent: "center", display: "flex", gap: 10 }}>
          <p>Thème :</p>
          <select
            value={themeName}
            onChange={e => setThemeName(e.target.value as Theme)}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: `1px solid ${theme.buttonBorder}`,
              backgroundColor: theme.buttonBg,
              color: theme.buttonText,
              cursor: "pointer",
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </Popup>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
