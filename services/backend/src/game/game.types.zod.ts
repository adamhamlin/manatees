import { z } from 'zod';

export {
  gameCancelledReasonSchema,
  gameplayStateSchema,
  playerCurrentGameplayInfoSchema,
  playerLeftGameReasonSchema,
  playersAndScoresSchema,
} from '@manatees/shared/types';

export const gameRoundSkippedReasonSchema = z.enum(['skippedByAdmin', 'playerLeft']);
export const gameAdminActionSchema = z.enum([
  'start',
  'updateConfig',
  'skipToNextRound',
  'cancel',
  'delete',
  'removePlayer',
  'addNonHumanPlayer',
  'approvePlayerJoin',
  'rejectPlayerJoin',
  'changePlayerScore',
  'autoPlayPlayer',
]);
