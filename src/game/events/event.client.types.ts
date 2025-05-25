import { z } from 'zod';

import { WhiteCardSchema } from '../../../prisma/generated/zod/index';

/**
 * Any event from client -> server
 */
export type ClientGameEvent = z.infer<typeof clientGameEventSchema>;

export const clientGameEventSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('cardsPlayed'),
    payload: z.strictObject({
      cards: z.array(WhiteCardSchema.shape.id),
    })
  }),
  z.strictObject({
    type: z.literal('winningCardsSelected'),
    payload: z.strictObject({
      winningCards: z.array(WhiteCardSchema.shape.id),
    })
  }),
  z.strictObject({
    type: z.literal('allGameInfoRequest'),
    payload: z.strictObject({})
  }),
]);
