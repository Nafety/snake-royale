export {};

declare global {
  interface Window {
    startSnakeGame?: (data: {
      mode: string;
      config: any;
      loadout: string[];
    }) => void;
  }
}
