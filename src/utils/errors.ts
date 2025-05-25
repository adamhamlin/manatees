import type { HttpErrorCodes } from '@fastify/sensible';
import { WhiteCard } from '@prisma/client';

import { GameAdminAction, GameId, UserId } from '../game/game.types';

export abstract class ManateesError extends Error {
  constructor(message: string, public statusCode: HttpErrorCodes) {
    super(message);
  }
}

export class GameNotFoundError extends ManateesError {
  constructor(gameId: GameId) {
    super(`Game with ID=${gameId} not found`, 404);
  }
}

export class GameConflictError extends ManateesError {
  constructor(gameId: GameId) {
    super(`Game with ID=${gameId} already exists`, 409);
  }
}

export class GameAdminActionForbiddenError extends ManateesError {
  constructor(action: GameAdminAction) {
    super(`Must be game admin to ${action} the game`, 403);
  }
}

export class GameConstraintViolationError extends ManateesError {
  constructor(message: string) {
    super(`Game constraint violation: ${message}`, 400);
  }
}

export class DeckExhaustedError extends ManateesError {
  constructor(deckColor: 'White' | 'Black') {
    super(`${deckColor} exhausted!`, 500);
  }
}

export class CardNotInHandError extends ManateesError {
  constructor(cardId: WhiteCard['id']) {
    super(`Card with ID=${cardId} not part of player hand`, 404);
  }
}

export class PlayerNotFoundError extends ManateesError {
  constructor(userId: UserId) {
    super(`User ${userId} is not playing the game`, 404);
  }
}

export class PlayerConflictError extends ManateesError {
  constructor(userId: UserId) {
    super(`User ${userId} is already playing the game`, 409);
  }
}

export class UnreachableError extends ManateesError {
  constructor(message: string) {
    super(message, 500);
  }
}