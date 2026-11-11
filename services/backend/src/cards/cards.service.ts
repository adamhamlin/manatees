import type { CustomDeckWithCards, DeckSearchHit, DeckWithCards, UserId } from '@manatees/shared/types';
import { Prisma, type BlackCard, type Deck, type WhiteCard } from '@prisma/client';

import {
  CustomDeckConflictError,
  CustomDeckForbiddenError,
  CustomDeckNotFoundError,
  DeckNotFoundError,
} from '@common/utils/errors';

import { CardsRepository } from './cards.repository';

export class CardsService {
  private readonly cardsRepository: CardsRepository;

  constructor() {
    this.cardsRepository = new CardsRepository();
  }

  async getDecks(): Promise<DeckSearchHit[]> {
    return this.cardsRepository.getDecks();
  }

  async getOwnedDecks(userId: UserId): Promise<DeckSearchHit[]> {
    return this.cardsRepository.getOwnedDecks(userId);
  }

  async getDeckById(deckId: number): Promise<DeckWithCards> {
    const deck = await this.cardsRepository.getDeckById(deckId);
    if (!deck) {
      throw new DeckNotFoundError(deckId);
    }
    return deck;
  }

  async getCustomDeck(deckId: number, userId: UserId): Promise<CustomDeckWithCards> {
    await this.assertDeckOwner(deckId, userId);
    const deck = await this.cardsRepository.getCustomDeck(deckId, userId);
    if (!deck) {
      throw new CustomDeckNotFoundError(deckId);
    }
    return deck;
  }

  async createDeck(userId: UserId, input: { name: string; watermark: string }): Promise<CustomDeckWithCards> {
    const deck = await this.withConflictHandling(
      () => this.cardsRepository.createDeck(userId, input.name, input.watermark),
      'A deck with this name or watermark already exists.'
    );
    return this.getCustomDeck(deck.id, userId);
  }

  async updateDeck(
    deckId: number,
    userId: UserId,
    updates: { name?: string; watermark?: string }
  ): Promise<CustomDeckWithCards> {
    await this.assertDeckOwner(deckId, userId);
    await this.withConflictHandling(
      () => this.cardsRepository.updateDeck(deckId, userId, updates),
      'A deck with this name or watermark already exists.'
    );
    return this.getCustomDeck(deckId, userId);
  }

  async deleteDeck(deckId: number, userId: UserId): Promise<void> {
    await this.assertDeckOwner(deckId, userId);
    if (!(await this.cardsRepository.deleteDeck(deckId, userId))) {
      throw new CustomDeckNotFoundError(deckId);
    }
  }

  async getDecksContainingCardText(
    type: 'white' | 'black',
    content: string,
    excludeDeckId?: number
  ): Promise<string[]> {
    return this.cardsRepository.findOtherDecksWithCardText(type, content, excludeDeckId);
  }

  async createWhiteCard(deckId: number, userId: UserId, content: string): Promise<WhiteCard> {
    await this.assertDeckOwner(deckId, userId);
    return this.withConflictHandling(
      () => this.cardsRepository.createWhiteCard(deckId, content),
      'A card with this text already exists in this deck.'
    );
  }

  async updateWhiteCard(deckId: number, cardId: number, userId: UserId, content: string): Promise<void> {
    await this.assertDeckOwner(deckId, userId);
    const updated = await this.withConflictHandling(
      () => this.cardsRepository.updateWhiteCard(deckId, cardId, content),
      'A card with this text already exists in this deck.'
    );
    if (!updated) {
      throw new CustomDeckNotFoundError(deckId);
    }
  }

  async deleteWhiteCard(deckId: number, cardId: number, userId: UserId): Promise<void> {
    await this.assertDeckOwner(deckId, userId);
    if (!(await this.cardsRepository.deleteWhiteCard(deckId, cardId))) {
      throw new CustomDeckNotFoundError(deckId);
    }
  }

  async createBlackCard(deckId: number, userId: UserId, content: string, pickCount: number): Promise<BlackCard> {
    await this.assertDeckOwner(deckId, userId);
    return this.withConflictHandling(
      () => this.cardsRepository.createBlackCard(deckId, content, pickCount),
      'A card with this text already exists in this deck.'
    );
  }

  async updateBlackCard(
    deckId: number,
    cardId: number,
    userId: UserId,
    content: string,
    pickCount: number
  ): Promise<void> {
    await this.assertDeckOwner(deckId, userId);
    const updated = await this.withConflictHandling(
      () => this.cardsRepository.updateBlackCard(deckId, cardId, content, pickCount),
      'A card with this text already exists in this deck.'
    );
    if (!updated) {
      throw new CustomDeckNotFoundError(deckId);
    }
  }

  async deleteBlackCard(deckId: number, cardId: number, userId: UserId): Promise<void> {
    await this.assertDeckOwner(deckId, userId);
    if (!(await this.cardsRepository.deleteBlackCard(deckId, cardId))) {
      throw new CustomDeckNotFoundError(deckId);
    }
  }

  getCardsRandomized(deckIds: Array<Deck['id']>): Promise<{ whiteCards: WhiteCard[]; blackCards: BlackCard[] }> {
    return this.cardsRepository.getCardsRandomized(deckIds);
  }

  getCardCounts(deckIds: Array<Deck['id']>): Promise<{ whiteCardCount: number; blackCardCount: number }> {
    return this.cardsRepository.getCardCounts(deckIds);
  }

  private async assertDeckOwner(deckId: number, userId: UserId): Promise<void> {
    const deck = await this.cardsRepository.getDeckOwner(deckId);
    if (!deck) {
      throw new CustomDeckNotFoundError(deckId);
    }
    if (deck.createdBy !== userId) {
      throw new CustomDeckForbiddenError();
    }
  }

  private async withConflictHandling<T>(operation: () => Promise<T>, message: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new CustomDeckConflictError(message);
      }
      throw error;
    }
  }
}
