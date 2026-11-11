import type { UserId } from '@manatees/shared/types';
import { WhiteCard } from '@prisma/client';
import { z } from 'zod';

import {
  gameAdminActionSchema,
  gameCancelledReasonSchema,
  gameplayStateSchema,
  gameRoundSkippedReasonSchema,
  playerCurrentGameplayInfoSchema,
  playerLeftGameReasonSchema,
  playersAndScoresSchema,
} from './game.types.zod';
import type { Player } from './player/player';

export type GameplayState = z.infer<typeof gameplayStateSchema>;
export type PlayerCurrentGameplayInfo = z.infer<typeof playerCurrentGameplayInfoSchema>;

export type PlayersAndScores = z.infer<typeof playersAndScoresSchema>;
export type PlayerLeftGameReason = z.infer<typeof playerLeftGameReasonSchema>;
export type GameCancelledReason = z.infer<typeof gameCancelledReasonSchema>;
export type GameRoundSkippedReason = z.infer<typeof gameRoundSkippedReasonSchema>;
export type GameAdminAction = z.infer<typeof gameAdminActionSchema>;

// Stuff we don't want to use Zod for
export type PlayerMap = Map<UserId, Player>;
export type PlayerHand = Map<WhiteCard['id'], WhiteCard>;
