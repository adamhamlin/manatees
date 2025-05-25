import { z } from 'zod';

import { BlackCardSchema, DeckSchema, WhiteCardSchema } from '../../prisma/generated/zod/index';

// Common helper types
const naturalNumberSchema = z.number().int().nonnegative();

// All the types
export const gameIdSchema = z.string();
export const userIdSchema = z.string();
export const gameSettingsSchema = z.strictObject({
  deckIds: z.array(DeckSchema.shape.id),
  winningScore: naturalNumberSchema,
  handSize: naturalNumberSchema,
  // TODO: Add more things
});

export const gameplayStateSchema = z.enum(['created', 'playing', 'judging', 'roundCompleted', 'gameCompleted']);
export const playerLeftGameReasonSchema = z.enum(['voluntary', 'connectionLost', 'removedByAdmin']);
export const gameCancelledReasonSchema = z.enum(['cancelledByAdmin', 'tooFewHumanPlayers', 'internalError']);
export const gameRoundSkippedReasonSchema = z.enum(['skippedByAdmin', 'playerLeft']);
export const gameAdminActionSchema = z.enum([
  'start',
  'updateConfig',
  'skipToNextRound',
  'cancel',
  'delete',
  'removePlayer',
  'addNonHumanPlayer',
]);

export const gameSummarySchema = z.strictObject({
  id: gameIdSchema,
  gameConfig: gameSettingsSchema,
  playerCount: naturalNumberSchema,
  humanPlayerCount: naturalNumberSchema,
  admin: userIdSchema,
  inProgress: z.boolean(),
});

const playerInfoSchema = z.strictObject({
  score: naturalNumberSchema,
  isHuman: z.boolean(),
});

export const playersAndScoresSchema = z.record(userIdSchema, playerInfoSchema);

export const playerCurrentGameplayInfoSchema = z.strictObject({
  blackCard: BlackCardSchema,
  hand: z.array(WhiteCardSchema),
  state: gameplayStateSchema,
  playersAndScores: playersAndScoresSchema,
});
