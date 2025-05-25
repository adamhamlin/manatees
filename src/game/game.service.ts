import { match } from 'ts-pattern';

import { gameEventChannel, GameEvents } from './events/event.internal';
import { Game } from './game';
import { GameAdminAction, GameSettings, GameId, GameMap, GameSummary } from './game.types';
import { configuration } from '../app.config';
import { Player } from './player/player';
import { User } from '../user/user';
import { NonHumanPlayer } from './player/player.non-human';
import {
  GameAdminActionForbiddenError,
  GameConflictError,
  GameConstraintViolationError,
  GameNotFoundError,
} from '../utils/errors';
import { LOGGER } from '../utils/logger';

export class GameService {
  private gameMap: GameMap;

  constructor() {
    this.gameMap = new Map();
    this.listenToGameEvents();
  }

  getGamesList(): GameSummary[] {
    return [...this.gameMap.values()].map((g) => g.toGameSummary());
  }

  createGame(gameId: GameId, player: Player): Game {
    if (this.gameMap.has(gameId)) {
      throw new GameConflictError(gameId);
    }
    if (this.gameMap.size >= configuration.gameService.maxGames) {
      throw new GameConstraintViolationError(
        `Cannot have more than ${configuration.gameService.maxGames} concurrent games`
      );
    }
    const game: Game = new Game(gameId, player);
    this.gameMap.set(gameId, game);
    return game;
  }

  getGame(gameId: GameId): Game | undefined {
    return this.gameMap.get(gameId);
  }

  getGameOrThrow(gameId: GameId): Game {
    const game = this.getGame(gameId);
    if (!game) {
      throw new GameNotFoundError(gameId);
    }
    return game;
  }

  createOrJoinGame(gameId: GameId, player: Player): Game {
    return match(this.getGame(gameId))
      .with(undefined, () => {
        return this.createGame(gameId, player);
      })
      .otherwise((game) => {
        // Join existing game
        game.addPlayer(player);
        return game;
      });
  }

  leaveGame(gameId: GameId, requester: User): void {
    const game = this.getGameOrThrow(gameId);
    game.removePlayer(requester, 'voluntary');
  }

  updateGameConfig(gameId: GameId, requester: User, updates: Partial<GameSettings>): GameSettings {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'updateConfig');
    const effectiveConfig = game.updateConfig(updates);
    return effectiveConfig;
  }

  async startGame(gameId: GameId, requester: User): Promise<void> {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'start');
    await game.start();
  }

  cancelGame(gameId: GameId, requester: User): void {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'cancel');
    game.cancel('cancelledByAdmin');
  }

  skipToNextRound(gameId: GameId, requester: User): void {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'skipToNextRound');
    game.skipToNextRound('skippedByAdmin');
  }

  deleteGame(gameId: GameId, requester: User): void {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'delete');
    game.destroy();
    this.gameMap.delete(gameId);
    LOGGER.info({ gameId, reason: `requested by admin` }, `Game deleted`);
  }

  removePlayer(gameId: GameId, requester: User, toRemove: User): void {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'removePlayer');
    game.removePlayer(toRemove, 'removedByAdmin');
  }

  addNonHumanPlayer(gameId: GameId, requester: User, toAdd: User): void {
    const game = this.getGameAndValidateAdminOnlyAction(gameId, requester, 'addNonHumanPlayer');
    game.addPlayer(new NonHumanPlayer(toAdd));
  }

  private getGameAndValidateAdminOnlyAction(gameId: GameId, requester: User, action: GameAdminAction): Game {
    const game = this.getGameOrThrow(gameId);
    if (!game.isAdmin(requester)) {
      throw new GameAdminActionForbiddenError(action);
    }
    return game;
  }

  private listenToGameEvents(): void {
    gameEventChannel.on(GameEvents.NO_HUMAN_PLAYERS, (gameId: GameId) => {
      this.gameMap.delete(gameId);
      LOGGER.info({ gameId, reason: 'no human players remaining' }, `Game deleted`);
    });
  }
}
