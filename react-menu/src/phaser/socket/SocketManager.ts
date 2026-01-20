// src/phaser/socket/SocketManager.ts
import { io, Socket } from "socket.io-client";

type ListenerCallback = (data: any) => void;

export class SocketManager {
  socket: Socket;
  listeners: Map<string, ListenerCallback[]>;

  constructor() {
    this.socket = io();
    this.listeners = new Map();

    console.log("[SocketManager] Socket created");

    this.socket.on("connect", () => console.log("[SocketManager] Connected", this.socket.id));
    this.socket.on("disconnect", (reason) => console.log("[SocketManager] Disconnected:", reason));
    this.socket.on("state", (state) => console.log("[SocketManager] state received", state));
    this.socket.on("playerReset", () => console.log("[SocketManager] playerReset received"));
  }

  on(event: string, cb: ListenerCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
    this.socket.on(event, cb);
  }

  emit(event: string, data?: any) {
    console.log("[SocketManager] emit", event, data);
    this.socket.emit(event, data);
  }

  off(event: string, cb?: ListenerCallback) {
    if (!cb) {
      this.socket.off(event);
      this.listeners.delete(event);
    } else {
      this.socket.off(event, cb);
      const arr = this.listeners.get(event);
      if (arr) this.listeners.set(event, arr.filter(fn => fn !== cb));
    }
  }
}

// Singleton
export const socketManager = new SocketManager();
