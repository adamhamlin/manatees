import { EventEmitter } from 'events';

/**
 * For select communications btw Game and GameService
 */
export const gameEventChannel = new EventEmitter();
// One listener per open lobby stream
gameEventChannel.setMaxListeners(0);

export enum GameEvents {
  NO_HUMAN_PLAYERS = 'noHumanPlayers',
  /** Anything visible in the games list (GameSummary) may have changed */
  GAMES_CHANGED = 'gamesChanged',
}

export function emitGamesChanged(): void {
  gameEventChannel.emit(GameEvents.GAMES_CHANGED);
}
