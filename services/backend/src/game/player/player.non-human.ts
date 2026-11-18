import type { ClientGameEvent, ServerGameEvent } from '@manatees/shared/types';

import { User } from '@user/user';

import { Player } from './player';

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
