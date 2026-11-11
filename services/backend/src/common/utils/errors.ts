import type { HttpErrorCodes } from '@fastify/sensible';
import { apiErrorCodes, type ApiErrorCode, type GameId, type UserId } from '@manatees/shared/types';
import { WhiteCard } from '@prisma/client';

import type { GameAdminAction } from '@game/game.types';

/** `code` is serialized into the REST error response body */
export abstract class ManateesError extends Error {
  constructor(message: string, public statusCode: HttpErrorCodes, public code: ApiErrorCode) {
    super(message);
  }
}

export class UnauthorizedError extends ManateesError {
  constructor(msg?: string) {
    super(msg || 'Unauthorized', 401, apiErrorCodes.UNAUTHORIZED);
  }
}

export class TokenExpiredError extends ManateesError {
  constructor() {
    super(`User token has expired`, 401, apiErrorCodes.TOKEN_EXPIRED);
  }
}

export class GameNotFoundError extends ManateesError {
  constructor(gameId: GameId) {
    super(`Game with ID=${gameId} not found`, 404, apiErrorCodes.GAME_NOT_FOUND);
  }
}

export class UserNotFoundError extends ManateesError {
  constructor(userId: UserId) {
    super(`User with ID=${userId} not found`, 404, apiErrorCodes.USER_NOT_FOUND);
  }
}

export class DisplayNameConflictError extends ManateesError {
  constructor(displayName: string) {
    super(`Display name "${displayName}" is already in use by another user`, 409, apiErrorCodes.DISPLAY_NAME_CONFLICT);
  }
}

export class GameConflictError extends ManateesError {
  constructor(gameId: GameId) {
    super(`Game with ID=${gameId} already exists`, 409, apiErrorCodes.GAME_CONFLICT);
  }
}

export class DeckNotFoundError extends ManateesError {
  constructor(deckId: number) {
    super(`Deck with ID=${deckId} not found`, 404, apiErrorCodes.DECK_NOT_FOUND);
  }
}

export class CustomDeckNotFoundError extends DeckNotFoundError {
  constructor(deckId: number) {
    super(deckId);
  }
}

export class CustomDeckForbiddenError extends ManateesError {
  constructor() {
    super('Only the creator can modify this deck', 403, apiErrorCodes.DECK_ACTION_FORBIDDEN);
  }
}

export class CustomDeckConflictError extends ManateesError {
  constructor(message: string) {
    super(message, 409, apiErrorCodes.DECK_CONFLICT);
  }
}

export class GameAdminActionForbiddenError extends ManateesError {
  constructor(action: GameAdminAction) {
    super(`Must be game admin to ${action} the game`, 403, apiErrorCodes.GAME_ADMIN_ACTION_FORBIDDEN);
  }
}

export class GameConstraintViolationError extends ManateesError {
  constructor(message: string) {
    super(`Game constraint violation: ${message}`, 400, apiErrorCodes.GAME_CONSTRAINT_VIOLATION);
  }
}

export class DeckExhaustedError extends ManateesError {
  constructor(deckColor: 'White' | 'Black') {
    super(`${deckColor} exhausted!`, 500, apiErrorCodes.DECK_EXHAUSTED);
  }
}

export class CardNotInHandError extends ManateesError {
  constructor(cardId: WhiteCard['id']) {
    super(`Card with ID=${cardId} not part of player hand`, 404, apiErrorCodes.CARD_NOT_IN_HAND);
  }
}

export class PlayerNotFoundError extends ManateesError {
  constructor(userId: UserId) {
    super(`User ${userId} is not playing the game`, 404, apiErrorCodes.PLAYER_NOT_FOUND);
  }
}

export class PlayerConflictError extends ManateesError {
  constructor(userId: UserId) {
    super(`User ${userId} is already playing the game`, 409, apiErrorCodes.PLAYER_CONFLICT);
  }
}

export class UnreachableError extends ManateesError {
  constructor(message: string) {
    super(message, 500, apiErrorCodes.INTERNAL_ERROR);
  }
}
