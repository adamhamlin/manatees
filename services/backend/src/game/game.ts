import type { GameId, GameSettings, GameSnapshot, GameSummary, UserId } from '@manatees/shared/types';
import { assertDefined } from '@manatees/shared/utils/misc.utils';
import type { FastifyBaseLogger } from 'fastify';

import { GameConstraintViolationError } from '@common/utils/errors';
import { LOGGER } from '@common/utils/logger';
import { configuration } from '@config/app.config';

import { emitGamesChanged, gameEventChannel, GameEvents } from './events/event.internal';
import { GameConfig } from './game-config';
import { GameCancelledReason, GameRoundSkippedReason, PlayerLeftGameReason } from './game.types';
import { GamePlayers } from './gameplay/game-players';
import { Gameplay } from './gameplay/gameplay';
import { Player } from './player/player';
import { HumanPlayer } from './player/player.human';
import { User } from '../user/user';
import { GameDeck } from './gameplay/game-deck';

export class Game {
  private static readonly DISCONNECTED_NOTICE_DELAY_MS = 5_000;
  private static readonly DISCONNECTED_REMOVAL_DELAY_MS = 60_000;

  private readonly logger: FastifyBaseLogger;
  private readonly gameConfig: GameConfig;
  private readonly gamePlayers: GamePlayers;
  private readonly gameDeck: GameDeck;
  private readonly gameplay: Gameplay;
  private readonly pendingJoinRequests = new Map<UserId, HumanPlayer>();
  private readonly approvedJoinRequests = new Map<UserId, HumanPlayer>();
  private readonly disconnectTimers = new Map<
    UserId,
    { notice: ReturnType<typeof setTimeout>; removal: ReturnType<typeof setTimeout> }
  >();
  private destroyed = false;

  constructor(public id: GameId, private admin: Player) {
    this.logger = LOGGER.child({ gameId: id }, { msgPrefix: '[GameLog] >> ' });
    this.gameConfig = new GameConfig();
    this.gamePlayers = new GamePlayers();
    this.gameDeck = new GameDeck(this.gamePlayers);
    this.gameplay = new Gameplay(
      this.gameConfig,
      this.gamePlayers,
      this.gameDeck,
      () => this.admitApprovedPlayers(),
      () => this.clearJoinRequests()
    );
    this.addPlayer(admin);
    this.logger.info({ admin: admin.user.id }, 'Game created');
  }

  addPlayer(player: Player): void {
    if (this.gamePlayers.has(player.user.id)) {
      const existingPlayer = this.gamePlayers.get(player.user.id);
      if (existingPlayer instanceof HumanPlayer && player instanceof HumanPlayer) {
        existingPlayer.reconnect(player);
        this.clearDisconnectTimers(player.user.id);
        this.logger.info(`Player ${player.user.id} reconnected`);
        this.gamePlayers.notifyAll({ type: 'playerReconnected', payload: { player: existingPlayer.user } });
        this.gamePlayers.notifyAll({ type: 'gameSnapshot', payload: this.getGameSnapshot() });
        existingPlayer.notify({
          type: 'handUpdated',
          payload: { hand: [...existingPlayer.getHand().values()] },
        });
        if (this.isAdmin(existingPlayer.user)) {
          this.notifyPendingJoinRequests();
        }
        return;
      }
    }

    const pendingPlayer = this.pendingJoinRequests.get(player.user.id);
    if (pendingPlayer) {
      if (!(player instanceof HumanPlayer)) {
        throw new GameConstraintViolationError('Only human players can reconnect to a join request');
      }
      pendingPlayer.reconnect(player);
      pendingPlayer.notify({
        type: 'playerJoinRequestUpdated',
        payload: { player: pendingPlayer.user, isApproved: false },
      });
      return;
    }

    const approvedPlayer = this.approvedJoinRequests.get(player.user.id);
    if (approvedPlayer) {
      if (!(player instanceof HumanPlayer)) {
        throw new GameConstraintViolationError('Only human players can reconnect to an approved join request');
      }
      approvedPlayer.reconnect(player);
      approvedPlayer.notify({
        type: 'playerJoinRequestUpdated',
        payload: { player: approvedPlayer.user, isApproved: true },
      });
      return;
    }

    if (this.gameplay.isInProgress()) {
      this.requestPlayerAdmission(player);
      return;
    }

    this.attachPlayer(player);
  }

  approvePlayerJoin(userId: UserId): void {
    const player = this.pendingJoinRequests.get(userId);
    if (!player) {
      throw new GameConstraintViolationError(`No pending join request for player ${userId}`);
    }
    if (this.gamePlayers.getPlayerCount() + this.approvedJoinRequests.size >= configuration.game.players.maxPlayers) {
      throw new GameConstraintViolationError('Game has reached its maximum player count');
    }

    this.pendingJoinRequests.delete(userId);
    this.approvedJoinRequests.set(userId, player);
    const event = {
      type: 'playerJoinRequestUpdated' as const,
      payload: { player: player.user, isApproved: true },
    };
    this.gamePlayers.notifyAll(event);
    player.notify(event);
  }

  rejectPlayerJoin(userId: UserId): void {
    const player = this.pendingJoinRequests.get(userId);
    if (!player) {
      throw new GameConstraintViolationError(`No pending join request for player ${userId}`);
    }

    this.pendingJoinRequests.delete(userId);
    this.gamePlayers.notifyAll({ type: 'playerJoinRequestCancelled', payload: { playerId: userId } });
    player.notify({ type: 'playerJoinRequestCancelled', payload: { playerId: userId } });
    player.disconnect();
  }

  changePlayerScore(userId: UserId, newScore: number): void {
    if (newScore < 0 || newScore >= this.gameConfig.winningScore) {
      throw new GameConstraintViolationError(`Player score must be between 0 and ${this.gameConfig.winningScore - 1}`);
    }
    this.gamePlayers.get(userId).setScore(newScore);
    this.gamePlayers.notifyAll({ type: 'gameSnapshot', payload: this.getGameSnapshot() });
  }

  private attachPlayer(player: Player): void {
    this.gamePlayers.add(player);

    this.logger.info({ isHuman: player.isHuman() }, `Player ${player.user.id} added/joined`);

    // Listen to this player
    player.onEvent((event) => this.gameplay.handlePlayerEvent(player, event));
    player.onClose(() => this.handlePlayerDisconnect(player));

    // Let everybody know and send new snapshot
    emitGamesChanged();
    this.gamePlayers.notifyAll({
      type: 'playerJoined',
      payload: {
        player: player.user,
      },
    });
    this.gamePlayers.notifyAll({
      type: 'gameSnapshot',
      payload: this.getGameSnapshot(),
    });
  }

  removePlayer(userId: UserId, reason: PlayerLeftGameReason): void {
    this.clearDisconnectTimers(userId);
    const leavingPlayer = this.gamePlayers.get(userId);
    this.gamePlayers.notifyAll({
      type: 'playerLeft',
      payload: {
        player: leavingPlayer.user,
        reason,
      },
    });
    const player = this.gamePlayers.remove(userId);
    emitGamesChanged();

    this.logger.info({ reason }, `Player ${player.user.id} removed/left`);

    this.gamePlayers.notifyAll({
      type: 'gameSnapshot',
      payload: this.getGameSnapshot(),
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
    if (this.isAdmin(userId)) {
      this.electNewAdmin();
    }
  }

  isAdmin(user: User | UserId): boolean {
    const userId = typeof user === 'string' ? user : user.id;
    return userId === this.admin.user.id;
  }

  updateConfig(updates: Partial<GameSettings>): GameSettings {
    const newConfig = this.gameConfig.upsert(updates);
    emitGamesChanged();
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
    this.gamePlayers.notifyAll({
      type: 'gameStarted',
      payload: {
        playersAndScores: this.gameplay.getPlayersAndScores(),
      },
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.clearJoinRequests();
    this.disconnectTimers.forEach(({ notice, removal }) => {
      clearTimeout(notice);
      clearTimeout(removal);
    });
    this.disconnectTimers.clear();
    this.gamePlayers.notifyAll({ type: 'gameDeleted', payload: {} });
    this.gamePlayers.disconnectPlayers();
  }

  cancel(reason: GameCancelledReason): void {
    this.clearJoinRequests();
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
    if (reason === 'skippedByAdmin') {
      this.gamePlayers.notifyAll({ type: 'adminSkippedRound', payload: {} });
    }
    this.gameplay.skipToNextRound();
    this.logger.info({ reason }, `Round skipped`);
  }

  autoPlayPlayer(userId: UserId): void {
    this.gameplay.autoPlayPlayer(userId);
  }

  toGameSummary(): GameSummary {
    return {
      id: this.id,
      gameConfig: this.gameConfig.toJSON(),
      playerCount: this.gamePlayers.getPlayerCount(),
      humanPlayerCount: this.gamePlayers.getHumanPlayerCount(),
      admin: this.admin.user,
      inProgress: this.gameplay.isInProgress(),
    };
  }

  getGameSnapshot(): GameSnapshot {
    return {
      ...this.gameplay.gameSnapshot,
      admin: this.admin.user,
    } as GameSnapshot;
  }

  private electNewAdmin(): void {
    // Just elect the first human player we find
    const newAdmin = this.gamePlayers.getPlayerList().find((player) => player.isHuman());
    assertDefined(newAdmin);

    this.admin = newAdmin;
    this.gamePlayers.notifyAll({
      type: 'gameAdminUpdated',
      payload: {
        newAdmin: newAdmin.user,
      },
    });
    this.notifyPendingJoinRequests();

    this.logger.info(`New game admin: ${newAdmin.user.id}`);
  }

  private handlePlayerDisconnect(player: Player): void {
    const userId = player.user.id;
    if (this.destroyed || !this.gamePlayers.has(userId) || this.gamePlayers.get(userId) !== player) {
      return;
    }

    this.logger.info(`Socket closed - Player ${userId}`);
    this.clearDisconnectTimers(userId);
    const notice = setTimeout(() => {
      if (this.isCurrentPlayer(player)) {
        this.gamePlayers.notifyAll({ type: 'playerDisconnected', payload: { player: player.user } });
      }
    }, Game.DISCONNECTED_NOTICE_DELAY_MS);
    const removal = setTimeout(() => {
      this.clearDisconnectTimers(userId);
      if (this.isCurrentPlayer(player)) {
        this.removePlayer(userId, 'connectionLost');
      }
    }, Game.DISCONNECTED_REMOVAL_DELAY_MS);
    this.disconnectTimers.set(userId, { notice, removal });
  }

  private requestPlayerAdmission(player: Player): void {
    if (!(player instanceof HumanPlayer)) {
      throw new GameConstraintViolationError('Only human players can request admission');
    }

    this.pendingJoinRequests.set(player.user.id, player);
    player.onClose(() => this.handleJoinRequestDisconnect(player));
    const event = {
      type: 'playerJoinRequestUpdated' as const,
      payload: { player: player.user, isApproved: false },
    };
    this.gamePlayers.notifyAll(event);
    player.notify({ type: 'gameSnapshot', payload: this.getGameSnapshot() });
    player.notify(event);
  }

  private notifyPendingJoinRequests(): void {
    this.pendingJoinRequests.forEach((player) => {
      this.admin.notify({
        type: 'playerJoinRequestUpdated',
        payload: { player: player.user, isApproved: false },
      });
    });
    this.approvedJoinRequests.forEach((player) => {
      this.admin.notify({
        type: 'playerJoinRequestUpdated',
        payload: { player: player.user, isApproved: true },
      });
    });
  }

  private admitApprovedPlayers(): void {
    const approvedPlayers = [...this.approvedJoinRequests.values()];
    this.approvedJoinRequests.clear();
    approvedPlayers.forEach((player) => this.attachPlayer(player));
  }

  private handleJoinRequestDisconnect(player: HumanPlayer): void {
    const userId = player.user.id;
    const wasPending = this.pendingJoinRequests.get(userId) === player;
    const wasApproved = this.approvedJoinRequests.get(userId) === player;
    if (!wasPending && !wasApproved) {
      return;
    }

    this.pendingJoinRequests.delete(userId);
    this.approvedJoinRequests.delete(userId);
    this.gamePlayers.notifyAll({ type: 'playerJoinRequestCancelled', payload: { playerId: userId } });
  }

  private clearJoinRequests(): void {
    const players = new Set([...this.pendingJoinRequests.values(), ...this.approvedJoinRequests.values()]);
    this.pendingJoinRequests.clear();
    this.approvedJoinRequests.clear();
    players.forEach((player) => {
      this.gamePlayers.notifyAll({ type: 'playerJoinRequestCancelled', payload: { playerId: player.user.id } });
      player.notify({ type: 'playerJoinRequestCancelled', payload: { playerId: player.user.id } });
      player.disconnect();
    });
  }

  private isCurrentPlayer(player: Player): boolean {
    return !this.destroyed && this.gamePlayers.has(player.user.id) && this.gamePlayers.get(player.user.id) === player;
  }

  private clearDisconnectTimers(userId: UserId): void {
    const timers = this.disconnectTimers.get(userId);
    if (timers) {
      clearTimeout(timers.notice);
      clearTimeout(timers.removal);
      this.disconnectTimers.delete(userId);
    }
  }

  private async validateGameConfig(): Promise<void> {
    await this.gameDeck.validate(this.gameConfig);
  }
}
