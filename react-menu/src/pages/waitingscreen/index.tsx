import { Button, ProgressBar } from "pixel-retroui";
import { socketManager } from "../../phaser/socket/SocketManager";
import type { ThemeColors } from "../../styles/theme";

type WaitingScreenProps = {
  theme: ThemeColors;
  progress: number;
  onCancel: () => void;
};

export default function WaitingScreen({
  theme,
  progress,
  onCancel,
}: WaitingScreenProps) {
  return (
    <div
      className="font-minecraft"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.background,
        padding: 20,
        color: theme.text,
      }}
    >
      <p style={{ color: theme.primary, marginBottom: 10 }}>
        Recherche en cours…
      </p>

      <div style={{ width: 300, marginBottom: 20 }}>
        <ProgressBar
          size="lg"
          color={theme.progressBarBg}
          borderColor={theme.progressBarBorder}
          progress={progress}
        />
      </div>

      <Button
        onClick={() => {
          socketManager.emit("leaveGame");
          onCancel();
        }}
        bg={theme.buttonBg}
        textColor={theme.buttonText}
        borderColor={theme.buttonBorder}
        shadow={theme.buttonShadow}
        style={{ marginTop: 16 }}
      >
        Retour au menu
      </Button>
    </div>
  );
}
