// src/styles/themes.ts
export type Theme = "dark" | "light";

export interface ThemeColors {
  primary: string;        // couleur principale, accents
  secondary: string;      // titres / highlights
  background: string;     // fond général
  cardBg: string;
  cardSelected: string;
  text: string;
  popupBg: string;
  popupBase: string;
  popupTextColor: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  buttonShadow: string;
  buttonParameterBg: string;
  buttonParameterTextColor: string;
  buttonParameterBorder: string;
  buttonParameterShadow: string;
  sliderTrack: string;
  sliderThumb: string;
  progressBarBg: string;
  progressBarBorder: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    primary: "#00ffcc",
    secondary: "#ffdd55",
    background: "#111",
    cardBg: "darkgray",
    cardSelected: "lightgreen",
    text: "white",
    popupBg: "darkgray",
    popupBase: "black",
    popupTextColor: "black",
    buttonBg: "black",
    buttonText: "white",
    buttonBorder: "white",
    buttonShadow: "white",
    buttonParameterBg: "white",
    buttonParameterTextColor: "black",
    buttonParameterBorder: "black",
    buttonParameterShadow: "black",
    sliderTrack: "#00ffcc",
    sliderThumb: "#00ffcc",
    progressBarBg: "#00ffcc",
    progressBarBorder: "#ffffff",
  },
  light: {
    primary: "#0077cc",
    secondary: "#ff8800",
    background: "#f0f0f0",
    cardBg: "#eee",
    cardSelected: "#88ff88",
    text: "#111",
    popupBg: "#ffffff",
    popupBase: "#cccccc",
    popupTextColor: "#111",
    buttonBg: "#ffffff",
    buttonText: "#111",
    buttonBorder: "#111",
    buttonShadow: "#888",
    buttonParameterBg: "#e0e0e0",
    buttonParameterTextColor: "#111",
    buttonParameterBorder: "#111",
    buttonParameterShadow: "#888",
    sliderTrack: "#ccc",
    sliderThumb: "#0077cc",
    progressBarBg: "#0077cc",
    progressBarBorder: "#000000",
  },
};
