import { WebSocket } from '@fastify/websocket';

export class Messenger {
  private readonly messageConsumers: Array<(message: string) => void> = [];
  private readonly closeConsumers: Array<() => void> = [];

  constructor(private socket: WebSocket) {}

  sendMessage<T extends string | object>(message: T): void {
    const toSend = typeof message === 'string' ? message : JSON.stringify(message);
    if (this.socket.readyState === 1) {
      this.socket.send(toSend);
    }
  }

  onMessageReceived<T extends string | object>(cb: (message: T) => void): void {
    const consumer = (message: string): void => {
      try {
        const parsedMessage = JSON.parse(message);
        cb(parsedMessage);
      } catch (_err) {
        cb(message as T);
      }
    };
    this.messageConsumers.push(consumer);
    this.bindMessageConsumer(consumer);
  }

  onClose(cb: () => void): void {
    this.closeConsumers.push(cb);
    this.bindCloseConsumer(cb);
  }

  replaceSocket(socket: WebSocket): void {
    this.socket = socket;
    this.messageConsumers.forEach((consumer) => this.bindMessageConsumer(consumer));
    this.closeConsumers.forEach((consumer) => this.bindCloseConsumer(consumer));
  }

  getSocket(): WebSocket {
    return this.socket;
  }

  close(): void {
    const closeCode = 1001; // client should not try to reconnect
    this.socket.close(closeCode);
  }

  private bindMessageConsumer(consumer: (message: string) => void): void {
    const socket = this.socket;
    socket.on('message', (rawMessage) => {
      // Edge case for messages arriving during socket replacement
      if (socket === this.socket) {
        const message = rawMessage.toString();
        consumer(message);
      }
    });
  }

  private bindCloseConsumer(consumer: () => void): void {
    const socket = this.socket;
    socket.on('close', () => {
      // Edge case for messages arriving during socket replacement
      if (socket === this.socket) {
        consumer();
      }
    });
  }
}
