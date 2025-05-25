import { EventEmitter } from 'events';

/**
 * For select communications btw Game and GameService
 */
export const gameEventChannel = new EventEmitter();

export enum GameEvents {
  NO_HUMAN_PLAYERS = 'noHumanPlayers',
}
