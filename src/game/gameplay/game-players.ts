import { configuration } from '../../app.config';
import { User } from '../../user/user';
import { GameConstraintViolationError, PlayerNotFoundError } from '../../utils/errors';
import { ServerGameEvent } from '../events/event.server.types';
import { PlayerMap, UserId } from '../game.types';
import { Player } from '../player/player';

/**
 * Class for managing and communicating with game players
 */
export class GamePlayers {
  private readonly playerMap: PlayerMap;

  private static readonly MINIMUM_HUMAN_PLAYER_COUNT = configuration.game.players.minHumanPlayers;

  constructor() {
    this.playerMap = new Map();
  }

  getPlayerCount(): number {
    return this.playerMap.size;
  }

  getHumanPlayerCount(): number {
    return [...this.playerMap.values()].filter((player) => player.isHuman()).length;
  }

  getPlayerList(): Player[] {
    return [...this.playerMap.values()];
  }

  getPlayerIds(): UserId[] {
    return [...this.playerMap.keys()];
  }

  get(userId: UserId): Player {
    const player = this.playerMap.get(userId);
    if (!player) {
      throw new PlayerNotFoundError(userId);
    }
    return player;
  }

  has(userId: UserId): boolean {
    return this.playerMap.has(userId);
  }

  add(player: Player): void {
    const userId = player.user.id;
    // If this player is already playing, we'll allow overwrite to account for reconnecting w/ new websocket
    const playerAlreadyInGame = this.has(userId);
    if (!playerAlreadyInGame && this.getPlayerCount() >= configuration.game.players.maxPlayers) {
      throw new GameConstraintViolationError(
        `Game cannot have more than ${configuration.game.players.maxPlayers} players`
      );
    }
    this.playerMap.set(userId, player);
  }

  remove(user: User): Player {
    const player = this.get(user.id);
    this.playerMap.delete(user.id);
    player.disconnect(); // TODO: Will this error if socket already closed?
    return player;
  }

  tooFewHumanPlayers(): boolean {
    return this.getHumanPlayerCount() < GamePlayers.MINIMUM_HUMAN_PLAYER_COUNT;
  }

  validatePlayerCount(): void {
    if (this.tooFewHumanPlayers()) {
      throw new GameConstraintViolationError(
        `Cannot start game with fewer than ${GamePlayers.MINIMUM_HUMAN_PLAYER_COUNT} human players`
      );
    }
  }

  notifyAll(event: ServerGameEvent): void {
    this.forEachPlayer((player) => {
      player.notify(event);
    });
  }

  resetPlayers(): void {
    this.forEachPlayer((player) => player.reset());
  }

  disconnectPlayers(): void {
    this.forEachPlayer((player) => {
      player.disconnect();
    });
  }

  forEachPlayer(cb: (player: Player) => void): void {
    this.playerMap.forEach((player) => {
      cb(player);
    });
  }
}
