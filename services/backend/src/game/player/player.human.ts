import { WebSocket } from '@fastify/websocket';
import type { ClientGameEvent, ServerGameEvent } from '@manatees/shared/types';

import { Messenger } from '@common/utils/messenger';
import { User } from '@user/user';

import { Player } from './player';

/**
 * Human player in a game
 */
export class HumanPlayer extends Player {
  private readonly messenger: Messenger;

  constructor(user: User, gameSocket: WebSocket) {
    super(user);
    this.messenger = new Messenger(gameSocket);
  }

  reconnect(replacement: HumanPlayer): void {
    this.messenger.replaceSocket(replacement.messenger.getSocket());
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
