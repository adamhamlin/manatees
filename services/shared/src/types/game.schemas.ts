import { z } from 'zod';

const naturalNumberSchema = z.number().int().nonnegative();

export const appConfiguration = {
  game: {
    global: {
      maxGames: 10,
    },
    players: {
      minHumanPlayers: 3,
      maxPlayers: 12,
    },
    hand: {
      size: { min: 4, max: 20, default: 10 },
    },
    deck: {
      minWhiteCardsPerPlayer: 32,
      minBlackCardsPerPlayer: 12,
    },
    winningScore: { min: 1, max: 30, default: 7 },
  },
};

export const gameIdSchema = z.uuid();
export const userIdSchema = z.string();
export const userSchema = z.strictObject({
  id: userIdSchema,
  email: z.string(),
  name: z.string(),
  displayName: z.string().nullable(),
});
export const userWithProfileSchema = userSchema.extend({
  createdAt: z.iso.datetime(),
});

export const gameplayStateSchema = z.enum(['created', 'playing', 'judging', 'roundCompleted', 'gameCompleted']);
export const playerLeftGameReasonSchema = z.enum(['voluntary', 'connectionLost', 'removedByAdmin']);
export const gameCancelledReasonSchema = z.enum(['cancelledByAdmin', 'tooFewHumanPlayers', 'internalError']);

const playerInfoSchema = z.strictObject({
  user: userSchema,
  score: naturalNumberSchema,
  isHuman: z.boolean(),
});

export const playersAndScoresSchema = z.record(userIdSchema, playerInfoSchema);

export const blackCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  pickCount: z.number().int(),
  deckId: z.number().int(),
});

export const whiteCardSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  deckId: z.number().int(),
});

export const gameSettingsSchema = z.strictObject({
  gameName: z.string().trim().min(1),
  deckIds: z.array(z.number().int()),
  winningScore: naturalNumberSchema
    .min(appConfiguration.game.winningScore.min)
    .max(appConfiguration.game.winningScore.max),
  handSize: naturalNumberSchema.min(appConfiguration.game.hand.size.min).max(appConfiguration.game.hand.size.max),
});

export const deckSearchHitSchema = z.strictObject({
  id: naturalNumberSchema,
  name: z.string().min(1),
  watermark: z.string().min(1).max(6),
  type: z.enum(['official', 'custom']),
  creator: z
    .strictObject({
      id: userIdSchema,
      name: z.string(),
      displayName: z.string().nullable(),
    })
    .nullable(),
});

export const playerCurrentGameplayInfoSchema = z.strictObject({
  blackCard: blackCardSchema,
  hand: z.array(whiteCardSchema),
  state: gameplayStateSchema,
  playersAndScores: playersAndScoresSchema,
});

const baseGameSnapshotSchema = z.strictObject({
  gameConfig: gameSettingsSchema,
  playersAndScores: playersAndScoresSchema,
  admin: userSchema,
});

const gameSnapshotInRoundSchema = baseGameSnapshotSchema.extend({
  judge: userSchema,
  blackCard: blackCardSchema,
});

export const gameSnapshotSchema = z.union([
  baseGameSnapshotSchema.extend({
    state: z.enum([gameplayStateSchema.enum.created, gameplayStateSchema.enum.gameCompleted]),
  }),
  gameSnapshotInRoundSchema.extend({
    state: z.literal(gameplayStateSchema.enum.playing),
    submittedPlayerIds: z.array(userIdSchema),
  }),
  gameSnapshotInRoundSchema.extend({
    state: z.enum([gameplayStateSchema.enum.judging, gameplayStateSchema.enum.roundCompleted]),
  }),
]);

export const gameSummarySchema = z.strictObject({
  id: gameIdSchema,
  gameConfig: gameSettingsSchema,
  playerCount: naturalNumberSchema,
  humanPlayerCount: naturalNumberSchema,
  admin: userSchema,
  inProgress: z.boolean(),
});

export type GameId = z.infer<typeof gameIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type User = z.infer<typeof userSchema>;
export type UserWithProfile = z.infer<typeof userWithProfileSchema>;
export type GameSettings = z.infer<typeof gameSettingsSchema>;
export type GameSnapshot = z.infer<typeof gameSnapshotSchema>;
export type GameSummary = z.infer<typeof gameSummarySchema>;
export type DeckSearchHit = z.infer<typeof deckSearchHitSchema>;
export type GameplayState = z.infer<typeof gameplayStateSchema>;
export type PlayerLeftGameReason = z.infer<typeof playerLeftGameReasonSchema>;
export type GameCancelledReason = z.infer<typeof gameCancelledReasonSchema>;
export type Player = z.infer<typeof playerInfoSchema>;
export type PlayersAndScores = z.infer<typeof playersAndScoresSchema>;
export type BlackCard = z.infer<typeof blackCardSchema>;
export type WhiteCard = z.infer<typeof whiteCardSchema>;
export type PlayerCurrentGameplayInfo = z.infer<typeof playerCurrentGameplayInfoSchema>;
