import { z } from 'zod';

import { BlackCardSchema, WhiteCardSchema } from '../../../prisma/generated/zod/index';
import { gameCancelledReasonSchema, gameSettingsSchema, gameplayStateSchema, playerLeftGameReasonSchema, playersAndScoresSchema, userIdSchema } from '../game.types.zod';

/**
 * Broadcast events from Server -> Clients
 */
export type ServerGameEvent = z.infer<typeof serverGameEventSchema>;

export const serverGameEventSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('gameCreated'),
    payload: z.strictObject({
      gameConfig: gameSettingsSchema,
      playersAndScores: playersAndScoresSchema,
      creator: userIdSchema,
    })
  }),
  z.strictObject({
    type: z.literal('playerJoined'),
    payload: z.strictObject({
      player: userIdSchema,
      playersAndScores: playersAndScoresSchema,
    })
  }),
  z.strictObject({
    type: z.literal('playerLeft'),
    payload: z.strictObject({
      player: userIdSchema,
      playersAndScores: playersAndScoresSchema,
      reason: playerLeftGameReasonSchema,
    })
  }),
  z.strictObject({
    type: z.literal('gameAdminUpdated'),
    payload: z.strictObject({
      newAdmin: userIdSchema,
    })
  }),
  z.strictObject({
    type: z.literal('gameConfigUpdated'),
    payload: z.strictObject({
      gameConfig: gameSettingsSchema,
    })
  }),
  z.strictObject({
    type: z.literal('gameStarted'),
    payload: z.strictObject({
      playersAndScores: playersAndScoresSchema,
    })
  }),
  z.strictObject({
    type: z.literal('handUpdated'),
    payload: z.strictObject({
      hand: z.array(WhiteCardSchema),
    })
  }),
  z.strictObject({
    type: z.literal('roundStarted'),
    payload: z.strictObject({
      blackCard: BlackCardSchema,
      judge: userIdSchema,
      playersAndScores: playersAndScoresSchema,
    })
  }),
  z.strictObject({
    type: z.literal('otherPlayerPlayedCards'),
    payload: z.strictObject({
      player: userIdSchema,
    })
  }),
  z.strictObject({
    type: z.literal('allPlayersPlayedCards'),
    payload: z.strictObject({
      allPlayedCards: z.array(z.array(WhiteCardSchema)),
    })
  }),
  z.strictObject({
    type: z.literal('roundCompleted'),
    payload: z.strictObject({
      winner: userIdSchema,
      winningCards: z.array(WhiteCardSchema),
    })
  }),
  z.strictObject({
    type: z.literal('playerGameInfoRequested'),
    payload: z.strictObject({
      blackCard: BlackCardSchema.nullable(),
      hand: z.array(WhiteCardSchema).nullable(),
      state: gameplayStateSchema,
      playersAndScores: playersAndScoresSchema,
    })
  }),
  z.strictObject({
    type: z.literal('gameCompleted'),
    payload: z.strictObject({
      winner: userIdSchema,
      playersAndScores: playersAndScoresSchema,
    })
  }),
  z.strictObject({
    type: z.literal('gameCancelled'),
    payload: z.strictObject({
      reason: gameCancelledReasonSchema,
    })
  }),
]);

// /**
//  * Broadcast events from Server -> Clients
//  */
// export type ServerGameEvent =
//   | {
//       type: 'gameCreated';
//       payload: { players: PlayersAndScores; gameConfig: GameConfig, creator: UserId };
//     }
//   | {
//       type: 'playerJoined';
//       payload: { player: UserId; players: PlayersAndScores };
//     }
//   | {
//       type: 'playerLeft';
//       payload: { player: UserId; players: PlayersAndScores, reason: PlayerLeftGameReason };
//     }
//   | {
//       type: 'gameAdminUpdated';
//       payload: { newAdmin: UserId; };
//     }
//   | {
//       type: 'gameConfigUpdated';
//       payload: { gameConfig: GameConfig };
//     }
//   | {
//       type: 'gameStarted';
//       payload: { players: PlayersAndScores };
//     }
//   | {
//       type: 'handUpdated';
//       payload: { hand: WhiteCard[] };
//     }
//   | {
//       type: 'roundStarted';
//       payload: { blackCard: BlackCard; judge: UserId; scores: PlayersAndScores };
//     }
//   | {
//       type: 'otherPlayerPlayedCards';
//       payload: { player: UserId };
//     }
//   | {
//       type: 'allPlayersPlayedCards';
//       payload: { allPlayedCards: Array<WhiteCard[]> }; // i.e., a list for each player
//     }
//   | {
//       type: 'roundCompleted';
//       payload: { winningCards: WhiteCard[]; winner: UserId };
//     }
//   | {
//       type: 'playerGameInfoRequested';
//       payload: {
//         blackCard: BlackCard | null;
//         hand: WhiteCard[] | null;
//         state: GameplayState;
//         scores: PlayersAndScores;
//       };
//     }
//   | {
//       type: 'gameCompleted';
//       payload: { winner: UserId; scores: PlayersAndScores };
//     }
//   | {
//       type: 'gameCancelled';
//       payload: { reason: GameCancelledReason };
//     };


