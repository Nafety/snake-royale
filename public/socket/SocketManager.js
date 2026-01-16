// singleton pour communiquer avec le serveur
export class SocketManager {
  constructor() {
    this.socket = io();
    this.listeners = new Map();
  }

  on(event, cb) {
    if(!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
    this.socket.on(event, cb);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}

export const socketManager = new SocketManager();
