import { BlackCard, WhiteCard } from '@prisma/client';
import { shuffle } from 'radashi';
import { match } from 'ts-pattern';

import { GameplayState, PlayerCurrentGameplayInfo, PlayersAndScores, UserId } from '../game.types';
import { GameDeck } from './game-deck';
import { GamePlayers } from './game-players';
import { JudgePicker } from './judge-picker';
import { GameConstraintViolationError } from '../../utils/errors';
import { MappedReverseSemaphore, SimpleReverseSempaphore } from '../../utils/semaphore';
import { assertExists } from '../../utils/utils';
import { ClientGameEvent, clientGameEventSchema } from '../events/event.client.types';
import { GameConfig } from '../game-config';
import { Player } from '../player/player';

export class Gameplay {
  private readonly judgePicker: JudgePicker;
  private readonly cardPlayWaiter: MappedReverseSemaphore<UserId, WhiteCard[]>;
  private readonly judgeWaiter: SimpleReverseSempaphore<Array<WhiteCard['id']>>;
  private readonly skipToNextRoundWaiter: SimpleReverseSempaphore<null>;

  private state: GameplayState;
  private blackCard: BlackCard;

  constructor(private gameConfig: GameConfig, private gamePlayers: GamePlayers, private gameDeck: GameDeck) {
    this.judgePicker = new JudgePicker(gamePlayers);
    this.cardPlayWaiter = new MappedReverseSemaphore(() => gamePlayers.getPlayerIds());
    this.judgeWaiter = new SimpleReverseSempaphore();
    this.skipToNextRoundWaiter = new SimpleReverseSempaphore();

    this.state = 'created';
    this.blackCard = {
      // Initialize with placeholder/dummy data to make types happy
      id: 0,
      deckId: 0,
      content: 'awaitingFirstRoundPlaceholder',
      pickCount: 0,
    };
  }

  async play(): Promise<void> {
    if (this.state !== 'created') {
      throw new GameConstraintViolationError(`Cannot start game in state '${this.state}'`);
    }
    await this.gameDeck.build({ deckIds: this.gameConfig.deckIds });

    let winner: Player | null = null;
    while (!winner) {
      winner = await Promise.race([this.playNextRound(), this.skipToNextRoundWaiter.wait()]);
    }

    this.completeGame(winner);
  }

  isInProgress(): boolean {
    return this.state !== 'created';
  }

  handlePlayerEvent(player: Player, event: ClientGameEvent): void {
    const parsedEvent = clientGameEventSchema.parse(event);
    match(parsedEvent)
      .with({ type: 'cardsPlayed' }, (matched) => {
        if (this.state !== 'playing') {
          throw new GameConstraintViolationError(`Playing cards not permitted during ${this.state} state`);
        }
        const removedCards = player.removeCardsFromHand(matched.payload.cards);
        this.cardPlayWaiter.signal(player.user.id, removedCards);
      })
      .with({ type: 'winningCardsSelected' }, (matched) => {
        if (!this.playerIsJudge(player)) {
          throw new GameConstraintViolationError(`Only the Card Czar may pick a winner`);
        }
        if (this.state !== 'judging') {
          throw new GameConstraintViolationError(`Picking a winning card is not permitted during ${this.state} state`);
        }
        this.judgeWaiter.signal(matched.payload.winningCards);
      })
      .with({ type: 'allGameInfoRequest' }, () => {
        player.notify({
          type: 'playerGameInfoRequested',
          payload: this.getPlayerGameInfo(player),
        });
      })
      .exhaustive();
  }

  getPlayersAndScores(): PlayersAndScores {
    const res: PlayersAndScores = {};
    this.gamePlayers.getPlayerList().forEach((player) => {
      res[player.user.id] = { score: player.getScore(), isHuman: player.isHuman() };
    });
    return res;
  }

  skipToNextRound(): void {
    this.skipToNextRoundWaiter.signal(null);
  }

  reset(): void {
    this.state = 'created';
  }

  // PRIVATE METHODS FOLLOW...

  private async playNextRound(): Promise<Player> {
    this.cardPlayWaiter.reset();
    this.judgeWaiter.reset();
    this.skipToNextRoundWaiter.reset();
    this.judgePicker.setNextJudge();
    this.dealCards();

    this.state = 'playing';
    this.gamePlayers.notifyAll({
      type: 'roundStarted',
      payload: {
        blackCard: this.blackCard,
        judge: this.judgePicker.getCurrentJudge().user.id,
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

    this.state = 'judging';
    const cardsPickedByJudge = await this.judgeWaiter.wait();
    const { winner, winningCards } = this.getRoundWinnerInfo(cardsPickedByJudge, allPlayedCardsMap);
    winner.incrementScore();

    this.state = 'roundCompleted';
    this.gamePlayers.notifyAll({
      type: 'roundCompleted',
      payload: {
        winner: winner.user.id,
        winningCards,
      },
    });

    if (winner.getScore() >= this.gameConfig.winningScore) {
      // Game is over
      return winner;
    } else {
      return this.playNextRound();
    }
  }

  private dealCards(): void {
    this.blackCard = this.gameDeck.drawBlackCard();

    // For dealing, let's just be declarative vs making assumptions about what
    // happened in the previous round
    this.gamePlayers.forEachPlayer((player) => {
      const numCardsToStartRoundWith = this.playerIsJudge(player)
        ? this.gameConfig.handSize
        : this.gameConfig.handSize + this.blackCard.pickCount - 1;
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
        const cards = player.chooseRandomCardsFromHand(this.blackCard.pickCount);
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
    this.state = 'gameCompleted';
    this.gamePlayers.notifyAll({
      type: 'gameCompleted',
      payload: {
        winner: winner.user.id,
        playersAndScores: this.getPlayersAndScores(),
      },
    });
    this.reset();
  }

  private playerIsJudge(player: Player): boolean {
    return player.user.id === this.judgePicker.getCurrentJudge().user.id;
  }

  private getPlayerGameInfo(player: Player): PlayerCurrentGameplayInfo {
    return {
      blackCard: this.blackCard,
      hand: [...player.getHand().values()],
      state: this.state,
      playersAndScores: this.getPlayersAndScores(),
    };
  }

  private getRoundWinnerInfo(
    winningCardIds: Array<WhiteCard['id']>,
    playedCardsMap: Map<UserId, WhiteCard[]>
  ): { winner: Player; winningCards: WhiteCard[] } {
    const foundEntry = [...playedCardsMap.entries()].find(([_userId, whiteCards]) => {
      return winningCardIds.includes(whiteCards[0].id);
    });
    assertExists(foundEntry);
    const [winnerId, winningCards] = foundEntry;
    const winner = this.gamePlayers.get(winnerId);
    assertExists(winner);
    return { winner, winningCards };
  }
}
