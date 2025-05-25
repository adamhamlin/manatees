import { Player } from './player';
import { User } from '../../user/user';
import { ClientGameEvent } from '../events/event.client.types';
import { ServerGameEvent } from '../events/event.server.types';

/**
 * Automated player in a game (i.e., Rando Cardrissian)
 */
export class NonHumanPlayer extends Player {

  constructor(user: User) {
    super(user);
  }

  isHuman(): boolean {
    return false;
  }

  notify(_event: ServerGameEvent): void {
    // no-op
  }

  onEvent(_cb: (event: ClientGameEvent) => void): void {
    // no-op
  }

  onClose(_cb: () => void): void {
    // no-op
  }

  disconnect(): void {
    // no-op
  }
}
