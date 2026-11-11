import type { GameId, GameSettings, GameSummary, UserId } from '@manatees/shared/types';

import {
  GameAdminActionForbiddenError,
  GameConflictError,
  GameConstraintViolationError,
  GameNotFoundError,
} from '@common/utils/errors';
import { LOGGER } from '@common/utils/logger';

import { emitGamesChanged, gameEventChannel, GameEvents } from './events/event.internal';
import { Game } from './game';
import { GameRepository } from './game.repository';
import { GameAdminAction } from './game.types';
import { configuration } from '../config/app.config';
import { Player } from './player/player';
import { User } from '../user/user';
import { NonHumanPlayer } from './player/player.non-human';

export class GameService {
  private readonly gameRepository: GameRepository;

  constructor() {
    this.gameRepository = new GameRepository();
    this.listenToGameEvents();
  }

  async getGamesList(): Promise<GameSummary[]> {
    return (await this.gameRepository.getAll()).map((game) => game.toGameSummary());
  }

  async createGame(gameId: GameId, player: Player): Promise<Game> {
    if (await this.gameRepository.has(gameId)) {
      throw new GameConflictError(gameId);
    }
    if ((await this.gameRepository.count()) >= configuration.game.global.maxGames) {
      throw new GameConstraintViolationError(
        `Cannot have more than ${configuration.game.global.maxGames} concurrent games`
      );
    }
    const game: Game = new Game(gameId, player);
    await this.gameRepository.create(game);
    emitGamesChanged();
    return game;
  }

  async getGame(gameId: GameId): Promise<Game | undefined> {
    return this.gameRepository.get(gameId);
  }

  async getGameOrThrow(gameId: GameId): Promise<Game> {
    const game = await this.getGame(gameId);
    if (!game) {
      throw new GameNotFoundError(gameId);
    }
    return game;
  }

  async createOrJoinGame(gameId: GameId, player: Player): Promise<Game> {
    const game = await this.getGame(gameId);
    if (!game) {
      return this.createGame(gameId, player);
    }
    game.addPlayer(player);
    return game;
  }

  async leaveGame(gameId: GameId, requester: User): Promise<void> {
    const game = await this.getGameOrThrow(gameId);
    game.removePlayer(requester.id, 'voluntary');
  }

  async updateGameConfig(gameId: GameId, requester: User, updates: Partial<GameSettings>): Promise<GameSettings> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'updateConfig');
    const effectiveConfig = game.updateConfig(updates);
    return effectiveConfig;
  }

  async startGame(gameId: GameId, requester: User): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'start');
    await game.start();
  }

  async cancelGame(gameId: GameId, requester: User): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'cancel');
    game.cancel('cancelledByAdmin');
  }

  async skipToNextRound(gameId: GameId, requester: User): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'skipToNextRound');
    game.skipToNextRound('skippedByAdmin');
  }

  async autoPlayPlayer(gameId: GameId, requester: User, playerId: UserId): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'autoPlayPlayer');
    game.autoPlayPlayer(playerId);
  }

  async deleteGame(gameId: GameId, requester: User): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'delete');
    game.destroy();
    await this.gameRepository.delete(gameId);
    emitGamesChanged();
    LOGGER.info({ gameId, reason: `requested by admin` }, `Game deleted`);
  }

  async removePlayer(gameId: GameId, requester: User, toRemove: UserId): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'removePlayer');
    game.removePlayer(toRemove, 'removedByAdmin');
  }

  async approvePlayerJoin(gameId: GameId, requester: User, toAdmit: UserId): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'approvePlayerJoin');
    game.approvePlayerJoin(toAdmit);
  }

  async rejectPlayerJoin(gameId: GameId, requester: User, toReject: UserId): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'rejectPlayerJoin');
    game.rejectPlayerJoin(toReject);
  }

  async changePlayerScore(gameId: GameId, requester: User, playerId: UserId, newScore: number): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'changePlayerScore');
    game.changePlayerScore(playerId, newScore);
  }

  async addNonHumanPlayer(gameId: GameId, requester: User, toAdd: UserId): Promise<void> {
    const game = await this.getGameAndValidateAdminOnlyAction(gameId, requester, 'addNonHumanPlayer');
    // Non-humans have no account, so the id doubles as the display name
    game.addPlayer(new NonHumanPlayer(new User(toAdd, '', toAdd, toAdd)));
  }

  private async getGameAndValidateAdminOnlyAction(
    gameId: GameId,
    requester: User,
    action: GameAdminAction
  ): Promise<Game> {
    const game = await this.getGameOrThrow(gameId);
    if (!game.isAdmin(requester)) {
      throw new GameAdminActionForbiddenError(action);
    }
    return game;
  }

  private listenToGameEvents(): void {
    gameEventChannel.on(GameEvents.NO_HUMAN_PLAYERS, (gameId: GameId) => {
      void this.gameRepository.delete(gameId).then(emitGamesChanged);
      LOGGER.info({ gameId, reason: 'no human players remaining' }, `Game deleted`);
    });
  }
}
