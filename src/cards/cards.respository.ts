import { Deck, WhiteCard, BlackCard, Prisma } from '@prisma/client';

import { BaseRepository } from '../utils/respository.base';

export class CardsRepository extends BaseRepository {
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
