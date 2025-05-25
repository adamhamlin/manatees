import { BlackCard, Deck, WhiteCard } from '@prisma/client';

import { GamePlayers } from './game-players';
import { configuration } from '../../app.config';
import { CardsRepository } from '../../cards/cards.respository';
import { DeckExhaustedError, GameConstraintViolationError } from '../../utils/errors';

type GameDeckConfig = {
  deckIds: Array<Deck['id']>;
}

export class GameDeck {
  private readonly cardsRepository: CardsRepository;
  private whiteCards: WhiteCard[];
  private blackCards: BlackCard[];

  private static readonly MINIMUM_WHITE_CARD_COUNT_PER_PLAYER = configuration.game.deck.minWhiteCardsPerPlayer;
  private static readonly MINIMUM_BLACK_CARD_COUNT_PER_PLAYER = configuration.game.deck.minBlackCardsPerPlayer;

  constructor(private gamePlayers: GamePlayers) {
    this.cardsRepository = new CardsRepository();
    this.whiteCards = [];
    this.blackCards = [];
  }

  async build(config: GameDeckConfig): Promise<this> {
    const {whiteCards, blackCards} = await this.cardsRepository.getCardsRandomized(config.deckIds);
    this.whiteCards = whiteCards;
    this.blackCards = blackCards;
    return this;
  }

  async validate(config: GameDeckConfig): Promise<void> {
    const deckIds = config.deckIds;
    if (deckIds.length === 0) {
      throw new GameConstraintViolationError('No game decks specified, please add decks.');
    }
    const {whiteCardCount, blackCardCount} = await this.cardsRepository.getCardCounts(deckIds);

    const numPlayers = this.gamePlayers.getPlayerCount();
    if (whiteCardCount < numPlayers * GameDeck.MINIMUM_WHITE_CARD_COUNT_PER_PLAYER) {
      throw new GameConstraintViolationError(`Game decks must contain at least ${GameDeck.MINIMUM_WHITE_CARD_COUNT_PER_PLAYER} white cards per player. Please add more decks.`);
    }
    if (blackCardCount < numPlayers * GameDeck.MINIMUM_BLACK_CARD_COUNT_PER_PLAYER) {
      throw new GameConstraintViolationError(`Game decks must contain at least ${GameDeck.MINIMUM_BLACK_CARD_COUNT_PER_PLAYER} black cards per player. Please add more decks.`);
    }
  }

  drawWhiteCards(count: number): WhiteCard[] {
    if (count > this.whiteCards.length) {
      throw new DeckExhaustedError('White');
    }
    const cardsToDeal = this.whiteCards.splice(0, count);
    return cardsToDeal;
  }

  drawBlackCard(): BlackCard {
    const cardToDeal = this.blackCards.pop();
    if (!cardToDeal) {
      throw new DeckExhaustedError('Black');
    }
    return cardToDeal;
  }

}