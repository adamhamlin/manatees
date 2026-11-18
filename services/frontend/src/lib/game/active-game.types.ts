import type { BlackCard, GameplayState, PlayersAndScores, User, WhiteCard } from '@manatees/shared/types';

export type ActiveGameState = {
  gamePhase: GameplayState | undefined;
  playersAndScores: PlayersAndScores;
  judge: User | undefined;
  blackCard: BlackCard | undefined;
  hand: WhiteCard[];
  submittedPlayerIds: string[];
  playedCards: WhiteCard[][];
  roundResult: { winner: User; winningCards: WhiteCard[] } | undefined;
  disconnectedPlayerIds: string[];
};
