import { createContext, useContext, useRef } from "react";
import type { ReactNode } from "react";

type MusicOptions = {
  loop?: boolean;
  volume?: number; // 0 à 1
};

type MusicContextType = {
  playMusic: (url: string, options?: MusicOptions) => void;
  stopMusic: () => void;
};

const MusicContext = createContext<MusicContextType>({
  playMusic: () => {},
  stopMusic: () => {},
});

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = (url: string, options?: MusicOptions) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto"; // précharge pour éviter le problème
    }

    const audio = audioRef.current;

    // Applique les options avant de jouer
    if (options?.loop !== undefined) audio.loop = options.loop;
    if (options?.volume !== undefined) audio.volume = options.volume;

    // Si l'audio a déjà une source différente, on la change proprement
    if (audio.src !== url) {
      audio.pause();    // stoppe la lecture en cours si nécessaire
      audio.src = url;  // change la source
      audio.load();     // force le préchargement
    }

    // Jouer l'audio et gérer la Promise
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // lecture démarrée correctement
        })
        .catch((err) => {
          // lecture impossible (autoplay bloqué, etc.)
          console.warn("Lecture audio impossible :", err);
        });
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <MusicContext.Provider value={{ playMusic, stopMusic }}>
      {children}
      <audio ref={audioRef} />
    </MusicContext.Provider>
  );
};
