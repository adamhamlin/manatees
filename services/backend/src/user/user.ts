import type { UserId } from '@manatees/shared/types';

/**
 * A unique user in the system
 */
export class User {
  public displayName: string;

  constructor(public id: UserId, public email: string, public name: string, displayName: string | null) {
    this.displayName = displayName ?? name;
  }
}
