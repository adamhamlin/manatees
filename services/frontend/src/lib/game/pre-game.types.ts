import type { GameSettings, PlayersAndScores, User } from '@manatees/shared/types';

export type PreGameState = {
  adminUser: User | undefined;
  playersAndScores: PlayersAndScores;
  gameConfig: GameSettings | undefined;
};
