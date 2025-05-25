import { WebSocket } from '@fastify/websocket';

import { Player } from './player';
import { User } from '../../user/user';
import { Messenger } from '../../utils/messenger';
import { ClientGameEvent } from '../events/event.client.types';
import { ServerGameEvent } from '../events/event.server.types';

/**
 * Human player in a game
 */
export class HumanPlayer extends Player {
  private readonly messenger: Messenger;

  constructor(user: User, gameSocket: WebSocket) {
    super(user);
    this.messenger = new Messenger(gameSocket);
  }

  isHuman(): boolean {
      return true;
  }

  notify(event: ServerGameEvent): void {
    this.messenger.sendMessage(event);
  }

  onEvent(cb: (event: ClientGameEvent) => void): void {
    this.messenger.onMessageReceived(cb);
  }

  onClose(cb: () => void): void {
    this.messenger.onClose(cb);
  }

  disconnect(): void {
    this.messenger.close();
  }
}
