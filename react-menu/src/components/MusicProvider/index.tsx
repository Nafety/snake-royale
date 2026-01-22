import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

type MusicOptions = {
  loop?: boolean;
  volume?: number;
};

type MusicContextType = {
  playMusic: (url: string, options?: MusicOptions) => void;
  stopMusic: () => void;
  setVolume: (v: number) => void; // 0 → 1
  setMuted: (m: boolean) => void;
  volume: number;
  isMuted: boolean;
};

const MusicContext = createContext<MusicContextType>({
  playMusic: () => {},
  stopMusic: () => {},
  setVolume: () => {},
  setMuted: () => {},
  volume: 0.4,
  isMuted: false,
});

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolumeState] = useState(0.4);
  const [isMuted, setMutedState] = useState(false);
  const currentSrc = useRef<string | null>(null);

  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    return audioRef.current;
  };

  const playMusic = (url: string, options?: MusicOptions) => {
    if (isMuted) return; // 🔇 respect du mute

    const audio = getAudio();

    if (currentSrc.current !== url) {
      audio.pause();
      audio.src = url;
      currentSrc.current = url;
      audio.load();
    }

    audio.loop = options?.loop ?? false;
    audio.volume = volume;

    // ✅ ne jamais empiler play()
    if (audio.paused) {
      audio.play().catch(() => {
        // autoplay bloqué → normal
      });
    }
  };

  const stopMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  };

  const setVolume = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);

    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const setMuted = (m: boolean) => {
    setMutedState(m);

    const audio = audioRef.current;
    if (!audio) return;

    if (m) {
      audio.pause();
    } else {
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  };

  return (
    <MusicContext.Provider
      value={{
        playMusic,
        stopMusic,
        setVolume,
        setMuted,
        volume,
        isMuted,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
