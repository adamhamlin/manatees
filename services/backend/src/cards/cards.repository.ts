import type { CustomDeckWithCards, DeckWithCards, DeckSearchHit, UserId } from '@manatees/shared/types';
import { Deck, WhiteCard, BlackCard, Prisma } from '@prisma/client';

import { BaseRepository } from '@repository/repository.base';

export class CardsRepository extends BaseRepository {
  /**
   * @returns all decks in the system
   */
  async getDecks(): Promise<DeckSearchHit[]> {
    return this.prisma.deck.findMany({
      select: {
        id: true,
        name: true,
        watermark: true,
        type: true,
        creator: { select: { id: true, name: true, displayName: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async getOwnedDecks(userId: UserId): Promise<DeckSearchHit[]> {
    return this.prisma.deck.findMany({
      where: { createdBy: userId },
      select: {
        id: true,
        name: true,
        watermark: true,
        type: true,
        creator: { select: { id: true, name: true, displayName: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCustomDeck(deckId: number, userId: UserId): Promise<CustomDeckWithCards | null> {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, createdBy: userId, type: 'custom' },
      select: {
        id: true,
        name: true,
        watermark: true,
        type: true,
        whiteCards: { select: { id: true, content: true }, orderBy: { id: 'asc' } },
        blackCards: { select: { id: true, content: true, pickCount: true }, orderBy: { id: 'asc' } },
      },
    });
    return deck?.type === 'custom' ? { ...deck, type: 'custom' } : null;
  }

  async getDeckById(deckId: number): Promise<DeckWithCards | null> {
    return this.prisma.deck.findUnique({
      where: { id: deckId },
      select: {
        id: true,
        name: true,
        watermark: true,
        type: true,
        whiteCards: { select: { id: true, content: true }, orderBy: { id: 'asc' } },
        blackCards: { select: { id: true, content: true, pickCount: true }, orderBy: { id: 'asc' } },
      },
    });
  }

  async findDeckByName(name: string): Promise<Pick<Deck, 'id'> | null> {
    return this.prisma.deck.findUnique({ where: { name }, select: { id: true } });
  }

  async createDeck(userId: UserId, name: string, watermark: string): Promise<Deck> {
    return this.prisma.deck.create({ data: { name, watermark, type: 'custom', createdBy: userId } });
  }

  async updateDeck(deckId: number, userId: UserId, updates: { name?: string; watermark?: string }): Promise<boolean> {
    const result = await this.prisma.deck.updateMany({ where: { id: deckId, createdBy: userId }, data: updates });
    return result.count > 0;
  }

  async deleteDeck(deckId: number, userId: UserId): Promise<boolean> {
    const result = await this.prisma.deck.deleteMany({ where: { id: deckId, createdBy: userId } });
    return result.count > 0;
  }

  async deckExists(deckId: number, userId: UserId): Promise<boolean> {
    return (await this.prisma.deck.count({ where: { id: deckId, createdBy: userId } })) > 0;
  }

  async getDeckOwner(deckId: number): Promise<{ createdBy: UserId | null } | null> {
    return this.prisma.deck.findUnique({ where: { id: deckId }, select: { createdBy: true } });
  }

  async findOtherDecksWithCardText(
    type: 'white' | 'black',
    content: string,
    excludeDeckId?: number
  ): Promise<string[]> {
    const where = { content, ...(excludeDeckId === undefined ? {} : { deckId: { not: excludeDeckId } }) };
    const cards =
      type === 'white'
        ? await this.prisma.whiteCard.findMany({ where, select: { deck: { select: { name: true } } } })
        : await this.prisma.blackCard.findMany({ where, select: { deck: { select: { name: true } } } });
    return [...new Set(cards.map((card) => card.deck.name))].sort((left, right) => left.localeCompare(right));
  }

  async createWhiteCard(deckId: number, content: string): Promise<WhiteCard> {
    return this.prisma.whiteCard.create({ data: { deckId, content } });
  }

  async updateWhiteCard(deckId: number, cardId: number, content: string): Promise<boolean> {
    const result = await this.prisma.whiteCard.updateMany({ where: { id: cardId, deckId }, data: { content } });
    return result.count > 0;
  }

  async deleteWhiteCard(deckId: number, cardId: number): Promise<boolean> {
    const result = await this.prisma.whiteCard.deleteMany({ where: { id: cardId, deckId } });
    return result.count > 0;
  }

  async createBlackCard(deckId: number, content: string, pickCount: number): Promise<BlackCard> {
    return this.prisma.blackCard.create({ data: { deckId, content, pickCount } });
  }

  async updateBlackCard(deckId: number, cardId: number, content: string, pickCount: number): Promise<boolean> {
    const result = await this.prisma.blackCard.updateMany({
      where: { id: cardId, deckId },
      data: { content, pickCount },
    });
    return result.count > 0;
  }

  async deleteBlackCard(deckId: number, cardId: number): Promise<boolean> {
    const result = await this.prisma.blackCard.deleteMany({ where: { id: cardId, deckId } });
    return result.count > 0;
  }

  /**
   * @param deckIds the specific decks to fetch
   * @returns a randomized list of white cards and black cards
   */
  async getCardsRandomized(deckIds: Array<Deck['id']>): Promise<{ whiteCards: WhiteCard[]; blackCards: BlackCard[] }> {
    const [whiteCards, blackCards] = await this.prisma.$transaction([
      this.prisma.$queryRaw<WhiteCard[]>`
        SELECT * FROM white_card
        WHERE "deckId" IN (${Prisma.join(deckIds)})
        ORDER BY RANDOM()
      `,
      this.prisma.$queryRaw<BlackCard[]>`
        SELECT * FROM black_card
        WHERE "deckId" IN (${Prisma.join(deckIds)})
        ORDER BY RANDOM()
      `,
    ]);
    return { whiteCards, blackCards };
  }

  /**
   * @param deckIds the decks to check
   * @returns counts of white cards and black cards in the specified decks
   */
  async getCardCounts(deckIds: Array<Deck['id']>): Promise<{ whiteCardCount: number; blackCardCount: number }> {
    const [whiteCardCount, blackCardCount] = await this.prisma.$transaction([
      this.prisma.whiteCard.count({ where: { deckId: { in: deckIds } } }),
      this.prisma.blackCard.count({ where: { deckId: { in: deckIds } } }),
    ]);
    return { whiteCardCount, blackCardCount };
  }
}
