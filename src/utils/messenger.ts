import { WebSocket } from '@fastify/websocket';

export class Messenger {
  constructor(private socket: WebSocket) {}

  sendMessage<T extends string | object>(message: T): void {
    const toSend = typeof message === 'string' ? message : JSON.stringify(message);
    this.socket.send(toSend);
  }

  onMessageReceived<T extends string | object>(cb: (message: T) => void): void {
    this.socket.on('message', (rawMessage) => {
      const message = rawMessage.toString();
      try {
        const parsedMessage = JSON.parse(message);
        cb(parsedMessage);
      } catch (_err) {
        cb(message as T);
      }
    });
  }

  close(): void {
    const closeCode = 1001; // client should not try to reconnect
    this.socket.close(closeCode);
  }

  onClose(cb: () => void): void {
    this.socket.on('close', cb);
  }
}