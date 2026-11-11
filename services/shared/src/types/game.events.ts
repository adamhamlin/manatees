import { z } from 'zod';

import {
  blackCardSchema,
  gameCancelledReasonSchema,
  gameSnapshotSchema,
  gameSettingsSchema,
  playerLeftGameReasonSchema,
  playersAndScoresSchema,
  userSchema,
  whiteCardSchema,
} from './game.schemas';

export const clientGameEventSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('cardsPlayed'),
    payload: z.strictObject({ cards: z.array(whiteCardSchema.shape.id) }),
  }),
  z.strictObject({
    type: z.literal('winningCardsSelected'),
    payload: z.strictObject({ winningCards: z.array(whiteCardSchema.shape.id) }),
  }),
]);

export const serverGameEventSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('gameSnapshot'),
    payload: gameSnapshotSchema,
  }),
  z.strictObject({
    type: z.literal('gameCreated'),
    payload: z.strictObject({
      creator: userSchema,
    }),
  }),
  z.strictObject({
    type: z.literal('playerJoined'),
    payload: z.strictObject({ player: userSchema }),
  }),
  z.strictObject({
    type: z.literal('playerJoinRequestUpdated'),
    payload: z.strictObject({ player: userSchema, isApproved: z.boolean() }),
  }),
  z.strictObject({
    type: z.literal('playerJoinRequestCancelled'),
    payload: z.strictObject({ playerId: z.string() }),
  }),
  z.strictObject({
    type: z.literal('playerReconnected'),
    payload: z.strictObject({ player: userSchema }),
  }),
  z.strictObject({
    type: z.literal('playerDisconnected'),
    payload: z.strictObject({ player: userSchema }),
  }),
  z.strictObject({
    type: z.literal('playerLeft'),
    payload: z.strictObject({
      player: userSchema,
      reason: playerLeftGameReasonSchema,
    }),
  }),
  z.strictObject({
    type: z.literal('gameAdminUpdated'),
    payload: z.strictObject({ newAdmin: userSchema }),
  }),
  z.strictObject({
    type: z.literal('gameConfigUpdated'),
    payload: z.strictObject({ gameConfig: gameSettingsSchema }),
  }),
  z.strictObject({
    type: z.literal('gameStarted'),
    payload: z.strictObject({ playersAndScores: playersAndScoresSchema }),
  }),
  z.strictObject({
    type: z.literal('handUpdated'),
    payload: z.strictObject({ hand: z.array(whiteCardSchema) }),
  }),
  z.strictObject({
    type: z.literal('roundStarted'),
    payload: z.strictObject({
      blackCard: blackCardSchema,
      judge: userSchema,
      playersAndScores: playersAndScoresSchema,
    }),
  }),
  z.strictObject({
    type: z.literal('otherPlayerPlayedCards'),
    payload: z.strictObject({ player: userSchema }),
  }),
  z.strictObject({
    type: z.literal('playerAutoPlayed'),
    payload: z.strictObject({ player: userSchema }),
  }),
  z.strictObject({
    type: z.literal('adminSkippedRound'),
    payload: z.strictObject({}),
  }),
  z.strictObject({
    type: z.literal('allPlayersPlayedCards'),
    payload: z.strictObject({ allPlayedCards: z.array(z.array(whiteCardSchema)) }),
  }),
  z.strictObject({
    type: z.literal('roundCompleted'),
    payload: z.strictObject({
      winner: userSchema,
      winningCards: z.array(whiteCardSchema),
    }),
  }),
  z.strictObject({
    type: z.literal('gameCompleted'),
    payload: z.strictObject({
      winner: userSchema,
      playersAndScores: playersAndScoresSchema,
    }),
  }),
  z.strictObject({
    type: z.literal('gameCancelled'),
    payload: z.strictObject({ reason: gameCancelledReasonSchema }),
  }),
  z.strictObject({
    type: z.literal('gameDeleted'),
    payload: z.strictObject({}),
  }),
]);

export type ClientGameEvent = z.infer<typeof clientGameEventSchema>;
export type ServerGameEvent = z.infer<typeof serverGameEventSchema>;
