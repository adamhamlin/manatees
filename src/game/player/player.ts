import { WhiteCard } from '@prisma/client';
import { shuffle } from 'radashi';

import { User } from '../../user/user';
import { CardNotInHandError } from '../../utils/errors';
import { ClientGameEvent } from '../events/event.client.types';
import { ServerGameEvent } from '../events/event.server.types';
import { PlayerHand } from '../game.types';

/**
 * Wrapper around a User entity playing in a game
 */
export abstract class Player {
  private hand: PlayerHand;
  private score: number;

  constructor(public readonly user: User) {
    this.hand = new Map();
    this.score = 0;
  }

  getScore(): number {
    return this.score;
  }

  incrementScore(): void {
    this.score += 1;
  }

  reset(): void {
    this.score = 0;
    this.hand.clear();
  }

  getHand(): PlayerHand {
    return this.hand;
  }

  getHandSize(): number {
    return this.hand.size;
  }

  addCardsToHand(cards: WhiteCard[]): void {
    cards.forEach((card) => {
      this.hand.set(card.id, card);
    });
    this.notifyHandUpdated();
  }

  removeCardsFromHand(cardIds: Array<WhiteCard['id']>): WhiteCard[] {
    const cards = cardIds.map((cardId) => {
      const card = this.hand.get(cardId);
      if (!card) {
        throw new CardNotInHandError(cardId);
      }
      this.hand.delete(cardId);
      return card;
    });
    this.notifyHandUpdated();
    return cards;
  }

  /**
   * This is really only meant for edge cases when a player leaves during a round and
   * another player may have "too many" cards in their hand
   */
  removeMostRecentlyDealtCardsFromHand(numCards: number): WhiteCard[] {
    // Remove cards from the "end", which is probably the most-recently dealt
    const cardIds = [...this.hand.keys()].slice(numCards * -1);
    return this.removeCardsFromHand(cardIds);
  }

  chooseRandomCardsFromHand(numCards: number): WhiteCard[] {
    return shuffle([...this.hand.values()]).slice(numCards * -1);
  }

  abstract notify(event: ServerGameEvent): void;

  abstract onEvent(cb: (event: ClientGameEvent) => void): void;

  abstract onClose(cb: () => void): void;

  abstract disconnect(): void;

  abstract isHuman(): boolean;

  private notifyHandUpdated(): void {
    this.notify({
      type: 'handUpdated',
      payload: {
        hand: [...this.hand.values()],
      },
    });
  }
}
