import { clientGameEventSchema, type ClientGameEvent, type GameSnapshot, type UserId } from '@manatees/shared/types';
import { assertDefined } from '@manatees/shared/utils/misc.utils';
import { BlackCard, WhiteCard } from '@prisma/client';
import { shuffle } from 'radashi';
import { match } from 'ts-pattern';

import { GameConstraintViolationError } from '@common/utils/errors';
import { MappedReverseSemaphore, SimpleReverseSempaphore } from '@common/utils/semaphore';
import { emitGamesChanged } from '@game/events/event.internal';
import { GameConfig } from '@game/game-config';
import { GameplayState, PlayersAndScores } from '@game/game.types';
import { Player } from '@game/player/player';

import { GameDeck } from './game-deck';
import { GamePlayers } from './game-players';
import { JudgePicker } from './judge-picker';

export class Gameplay {
  private readonly judgePicker: JudgePicker;
  private readonly cardPlayWaiter: MappedReverseSemaphore<UserId, WhiteCard[]>;
  private readonly judgeWaiter: SimpleReverseSempaphore<Array<WhiteCard['id']>>;
  private readonly skipToNextRoundWaiter: SimpleReverseSempaphore<null>;

  #state: GameplayState;
  #blackCard: BlackCard;
  #isStarting = false;

  constructor(
    private gameConfig: GameConfig,
    private gamePlayers: GamePlayers,
    private gameDeck: GameDeck,
    private onRoundStarting: () => void,
    private onGameCompleted: () => void
  ) {
    this.judgePicker = new JudgePicker(gamePlayers);
    this.cardPlayWaiter = new MappedReverseSemaphore(() =>
      gamePlayers.getPlayerIds().filter((playerId) => !this.playerIsJudge(playerId))
    );
    this.judgeWaiter = new SimpleReverseSempaphore();
    this.skipToNextRoundWaiter = new SimpleReverseSempaphore();

    this.#state = 'created';
    this.#blackCard = {
      // Initialize with placeholder/dummy data to make types happy
      id: 0,
      deckId: 0,
      content: 'awaitingFirstRoundPlaceholder',
      pickCount: 0,
    };
  }

  async play(): Promise<void> {
    if (this.#state !== 'created') {
      throw new GameConstraintViolationError(`Cannot start game in state '${this.#state}'`);
    }
    this.#isStarting = true;
    await this.gameDeck.build({ deckIds: this.gameConfig.deckIds });

    let winner: Player | null = null;
    while (!winner) {
      winner = await Promise.race([this.playNextRound(), this.skipToNextRoundWaiter.wait()]);
    }

    this.completeGame(winner);
  }

  get gameSnapshot(): Omit<GameSnapshot, 'admin'> {
    const baseInfo = {
      gameConfig: this.gameConfig.toJSON(),
      playersAndScores: this.getPlayersAndScores(),
    };
    return match(this.#state)
      .with('created', 'gameCompleted', (matched) => ({
        ...baseInfo,
        state: matched,
      }))
      .with('playing', (matched) => ({
        ...baseInfo,
        state: matched,
        judge: this.judgePicker.getCurrentJudge().user,
        blackCard: this.#blackCard,
        submittedPlayerIds: this.cardPlayWaiter.getSignaledKeys(),
      }))
      .with('judging', 'roundCompleted', (matched) => ({
        ...baseInfo,
        state: matched,
        judge: this.judgePicker.getCurrentJudge().user,
        blackCard: this.#blackCard,
      }))
      .exhaustive();
  }

  isInProgress(): boolean {
    return this.#isStarting || this.#state !== 'created';
  }

  handlePlayerEvent(player: Player, event: ClientGameEvent): void {
    const parsedEvent = clientGameEventSchema.parse(event);
    match(parsedEvent)
      .with({ type: 'cardsPlayed' }, (matched) => {
        if (this.#state !== 'playing') {
          throw new GameConstraintViolationError(`Playing cards not permitted during ${this.#state} state`);
        }
        if (this.playerIsJudge(player)) {
          throw new GameConstraintViolationError('The Card Czar may not play cards');
        }
        if (this.cardPlayWaiter.getSignaledKeys().includes(player.user.id)) {
          throw new GameConstraintViolationError('Cards have already been played this round');
        }
        const removedCards = player.removeCardsFromHand(matched.payload.cards);
        this.gamePlayers.notifyAll({
          type: 'otherPlayerPlayedCards',
          payload: { player: player.user },
        });
        this.cardPlayWaiter.signal(player.user.id, removedCards);
      })
      .with({ type: 'winningCardsSelected' }, (matched) => {
        if (!this.playerIsJudge(player)) {
          throw new GameConstraintViolationError(`Only the Card Czar may pick a winner`);
        }
        if (this.#state !== 'judging') {
          throw new GameConstraintViolationError(`Picking a winning card is not permitted during ${this.#state} state`);
        }
        this.judgeWaiter.signal(matched.payload.winningCards);
      })
      .exhaustive();
  }

  getPlayersAndScores(): PlayersAndScores {
    const res: PlayersAndScores = {};
    this.gamePlayers.getPlayerList().forEach((player) => {
      res[player.user.id] = { user: player.user, score: player.getScore(), isHuman: player.isHuman() };
    });
    return res;
  }

  skipToNextRound(): void {
    this.skipToNextRoundWaiter.signal(null);
  }

  autoPlayPlayer(userId: UserId): void {
    if (this.#state !== 'playing') {
      throw new GameConstraintViolationError(`Cannot auto-play for a player during ${this.#state} state`);
    }

    const player = this.gamePlayers.get(userId);
    if (this.playerIsJudge(player)) {
      throw new GameConstraintViolationError('The judge cannot play cards');
    }
    if (this.cardPlayWaiter.getSignaledKeys().includes(userId)) {
      throw new GameConstraintViolationError('Player has already played cards this round');
    }

    const cards = player.chooseRandomCardsFromHand(this.#blackCard.pickCount);
    this.handlePlayerEvent(player, {
      type: 'cardsPlayed',
      payload: { cards: cards.map((card) => card.id) },
    });
    player.notify({ type: 'playerAutoPlayed', payload: { player: player.user } });
  }

  reset(): void {
    this.#isStarting = false;
    this.#state = 'created';
    emitGamesChanged();
  }

  // PRIVATE METHODS FOLLOW...

  private async playNextRound(): Promise<Player> {
    this.onRoundStarting();
    this.judgePicker.setNextJudge();
    this.cardPlayWaiter.reset();
    this.judgeWaiter.reset();
    this.skipToNextRoundWaiter.reset();
    this.dealCards();

    if (this.#state === 'created') {
      // First round: the game just became "in progress"
      emitGamesChanged();
    }
    this.#state = 'playing';
    this.#isStarting = false;
    this.gamePlayers.notifyAll({
      type: 'roundStarted',
      payload: {
        blackCard: this.#blackCard,
        judge: this.judgePicker.getCurrentJudge().user,
        playersAndScores: this.getPlayersAndScores(),
      },
    });

    this.playCardsForRandoPlayers();

    const allPlayedCardsMap = await this.cardPlayWaiter.wait();
    this.gamePlayers.notifyAll({
      type: 'allPlayersPlayedCards',
      payload: {
        // Shuffle just for kicks
        allPlayedCards: shuffle([...allPlayedCardsMap.values()]),
      },
    });

    this.#state = 'judging';
    const cardsPickedByJudge = await this.judgeWaiter.wait();
    const { winner, winningCards } = this.getRoundWinnerInfo(cardsPickedByJudge, allPlayedCardsMap);
    winner.incrementScore();

    this.#state = 'roundCompleted';
    this.gamePlayers.notifyAll({
      type: 'roundCompleted',
      payload: {
        winner: winner.user,
        winningCards,
      },
    });

    // Introduce a delay before moving on to the next roudn
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    if (winner.getScore() >= this.gameConfig.winningScore) {
      // Game is over
      return winner;
    } else {
      return this.playNextRound();
    }
  }

  private dealCards(): void {
    this.#blackCard = this.gameDeck.drawBlackCard();

    // For dealing, let's just be declarative vs making assumptions about what
    // happened in the previous round
    this.gamePlayers.forEachPlayer((player) => {
      const numCardsToStartRoundWith = this.playerIsJudge(player)
        ? this.gameConfig.handSize
        : this.gameConfig.handSize + this.#blackCard.pickCount - 1;
      const numCardsToDeal = numCardsToStartRoundWith - player.getHandSize();
      if (numCardsToDeal > 0) {
        const cardsToDeal = this.gameDeck.drawWhiteCards(numCardsToDeal);
        player.addCardsToHand(cardsToDeal);
      } else if (numCardsToDeal < 0) {
        player.removeMostRecentlyDealtCardsFromHand(numCardsToDeal * -1);
      } else {
        // Happy day. Eat a banana
      }
    });
  }

  private playCardsForRandoPlayers(): void {
    this.gamePlayers.forEachPlayer((player) => {
      if (!player.isHuman()) {
        const cards = player.chooseRandomCardsFromHand(this.#blackCard.pickCount);
        this.handlePlayerEvent(player, {
          type: 'cardsPlayed',
          payload: {
            cards: cards.map((card) => card.id),
          },
        });
      }
    });
  }

  private completeGame(winner: Player): void {
    this.#state = 'gameCompleted';
    this.gamePlayers.notifyAll({
      type: 'gameCompleted',
      payload: {
        winner: winner.user,
        playersAndScores: this.getPlayersAndScores(),
      },
    });
    this.onGameCompleted();
    this.reset();
  }

  private playerIsJudge(player: Player | UserId): boolean {
    const userId = typeof player === 'string' ? player : player.user.id;
    return userId === this.judgePicker.getCurrentJudge().user.id;
  }

  private getRoundWinnerInfo(
    winningCardIds: Array<WhiteCard['id']>,
    playedCardsMap: Map<UserId, WhiteCard[]>
  ): { winner: Player; winningCards: WhiteCard[] } {
    const foundEntry = [...playedCardsMap.entries()].find(([_userId, whiteCards]) => {
      return winningCardIds.includes(whiteCards[0].id);
    });
    assertDefined(foundEntry, 'Cards selected by judge not found in played cards map');
    const [winnerId, winningCards] = foundEntry;
    const winner = this.gamePlayers.get(winnerId);
    return { winner, winningCards };
  }
}
