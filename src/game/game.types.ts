import { WhiteCard } from '@prisma/client';
import { z } from 'zod';

import type { Game } from './game';
import {
  gameAdminActionSchema,
  gameCancelledReasonSchema,
  gameSettingsSchema,
  gameIdSchema,
  gameplayStateSchema,
  gameRoundSkippedReasonSchema,
  gameSummarySchema,
  playerCurrentGameplayInfoSchema,
  playerLeftGameReasonSchema,
  playersAndScoresSchema,
  userIdSchema,
} from './game.types.zod';
import type { Player } from './player/player';

export type GameId = z.infer<typeof gameIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type GameSettings = z.infer<typeof gameSettingsSchema>;

export type GameplayState = z.infer<typeof gameplayStateSchema>;
export type GameSummary = z.infer<typeof gameSummarySchema>;
export type PlayerCurrentGameplayInfo = z.infer<typeof playerCurrentGameplayInfoSchema>;

export type PlayersAndScores = z.infer<typeof playersAndScoresSchema>;
export type PlayerLeftGameReason = z.infer<typeof playerLeftGameReasonSchema>;
export type GameCancelledReason = z.infer<typeof gameCancelledReasonSchema>;
export type GameRoundSkippedReason = z.infer<typeof gameRoundSkippedReasonSchema>;
export type GameAdminAction = z.infer<typeof gameAdminActionSchema>;

// Stuff we don't want to use Zod for
export type PlayerMap = Map<UserId, Player>;
export type GameMap = Map<GameId, Game>;
export type PlayerHand = Map<WhiteCard['id'], WhiteCard>;
