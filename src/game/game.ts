import type { FastifyBaseLogger } from 'fastify';

import { GameConfig } from './game-config';
import {
  GameCancelledReason,
  GameSettings,
  GameId,
  GameRoundSkippedReason,
  GameSummary,
  PlayerLeftGameReason,
} from './game.types';
import { LOGGER } from '../utils/logger';
import { gameEventChannel, GameEvents } from './events/event.internal';
import { Gameplay } from './gameplay/gameplay';
import { Player } from './player/player';
import { User } from '../user/user';
import { GamePlayers } from './gameplay/game-players';
import { assertExists } from '../utils/utils';
import { GameDeck } from './gameplay/game-deck';

export class Game {
  private readonly logger: FastifyBaseLogger;
  private readonly gameConfig: GameConfig;
  private readonly gamePlayers: GamePlayers;
  private readonly gameDeck: GameDeck;
  private readonly gameplay: Gameplay;

  constructor(public id: GameId, private admin: Player) {
    this.logger = LOGGER.child({ gameId: id }, { msgPrefix: '[GameLog] >> ' });
    this.gameConfig = new GameConfig();
    this.gamePlayers = new GamePlayers();
    this.gameDeck = new GameDeck(this.gamePlayers);
    this.gameplay = new Gameplay(this.gameConfig, this.gamePlayers, this.gameDeck);
    this.addPlayer(admin);
    this.logger.info({ admin: admin.user.id }, 'Game created');
  }

  addPlayer(player: Player): void {
    this.gamePlayers.add(player);

    this.logger.info({isHuman: player.isHuman() }, `Player ${player.user.id} added/joined`);

    // Listen to this player
    player.onEvent((event) => this.gameplay.handlePlayerEvent(player, event));
    player.onClose(() => {
      this.logger.info(`Socket closed - Player ${player.user.id}`);
      if (this.gamePlayers.has(player.user.id)) {
        this.removePlayer(player.user, 'connectionLost');
      }
    });

    // Let everybody else know
    this.gamePlayers.notifyAll({
      type: 'playerJoined',
      payload: {
        player: player.user.id,
        playersAndScores: this.gameplay.getPlayersAndScores(),
      },
    });
  }

  removePlayer(user: User, reason: PlayerLeftGameReason): void {
    const player = this.gamePlayers.remove(user);

    this.logger.info({ reason }, `Player ${player.user.id} removed/left`);

    this.gamePlayers.notifyAll({
      type: 'playerLeft',
      payload: {
        player: player.user.id,
        playersAndScores: this.gameplay.getPlayersAndScores(),
        reason,
      },
    });

    if (this.gameplay.isInProgress()) {
      if (this.gamePlayers.tooFewHumanPlayers()) {
        this.cancel('tooFewHumanPlayers');
        return;
      }
      this.skipToNextRound('playerLeft');
    }

    if (this.gamePlayers.getHumanPlayerCount() === 0) {
      gameEventChannel.emit(GameEvents.NO_HUMAN_PLAYERS, this.id);
      return;
    }

    // Always need an admin
    if (this.isAdmin(user)) {
      this.electNewAdmin();
    }
  }

  isAdmin(user: User): boolean {
    return user.id === this.admin.user.id;
  }

  updateConfig(updates: Partial<GameSettings>): GameSettings {
    const newConfig = this.gameConfig.upsert(updates);
    this.gamePlayers.notifyAll({
      type: 'gameConfigUpdated',
      payload: {
        gameConfig: newConfig,
      },
    });
    this.logger.info({ updates, effectiveConfig: newConfig }, 'Updated game config');

    return newConfig;
  }

  async start(): Promise<void> {
    this.gamePlayers.validatePlayerCount();
    await this.validateGameConfig();
    this.logger.info(`Game Started!`);
    // Gameplay is long-running process, fire and forget
    void this.gameplay.play().catch((err) => {
      this.logger.error(err, 'Unexpected error, canceling game');
      this.cancel('internalError'); // TODO: Maybe we don't always want this
    });
  }

  destroy(): void {
    this.gamePlayers.disconnectPlayers();
  }

  cancel(reason: GameCancelledReason): void {
    this.gamePlayers.notifyAll({
      type: 'gameCancelled',
      payload: {
        reason,
      },
    });
    this.gamePlayers.resetPlayers();
    this.gameplay.reset();
    this.logger.info({ reason }, `Game cancelled!`);
  }

  skipToNextRound(reason: GameRoundSkippedReason): void {
    this.gameplay.skipToNextRound();
    this.logger.info({ reason }, `Round skipped`);
  }

  toGameSummary(): GameSummary {
    return {
      id: this.id,
      gameConfig: this.gameConfig.toJSON(),
      playerCount: this.gamePlayers.getPlayerCount(),
      humanPlayerCount: this.gamePlayers.getHumanPlayerCount(),
      admin: this.admin.user.id,
      inProgress: this.gameplay.isInProgress(),
    };
  }

  private electNewAdmin(): void {
    // Just elect the first human player we find
    const newAdmin = this.gamePlayers.getPlayerList().find((player) => player.isHuman());
    assertExists(newAdmin);

    this.admin = newAdmin;
    this.gamePlayers.notifyAll({
      type: 'gameAdminUpdated',
      payload: {
        newAdmin: newAdmin.user.id,
      },
    });

    this.logger.info(`New game admin: ${newAdmin.user.id}`);
  }

  private async validateGameConfig(): Promise<void> {
    await this.gameDeck.validate(this.gameConfig);
  }
}
