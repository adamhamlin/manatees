import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'super-simple-fastify-server';
import { z, ZodSchema } from 'zod';

import { GameService } from './game.service';
import { gameSettingsSchema, gameIdSchema, gameSummarySchema, userIdSchema } from './game.types.zod';
import { User } from '../user/user';
import { HumanPlayer } from './player/player.human';

const gameService = new GameService(); // TODO: Dependency injection?

export async function gameRoutes(app: FastifyInstance): Promise<void> {
  const successResponseSchema = getResponseSchema(z.strictObject({ success: z.literal(true) }));

  /**
   * Get all current games
   */
  app.withTypeProvider<ZodTypeProvider>().get(
    '/game',
    {
      schema: {
        response: getResponseSchema(
          z.strictObject({
            games: z.array(gameSummarySchema),
          })
        ),
      },
    },
    async (_request, _reply) => {
      return { games: gameService.getGamesList() };
    }
  );

  /**
   * Create or join game
   */
  app.withTypeProvider<ZodTypeProvider>().get(
    '/game/:gameId',
    {
      websocket: true,
      exposeHeadRoute: false,
      schema: {
        params: z.strictObject({ gameId: gameIdSchema }),
      },
    },
    (socket, request) => {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string; // TODO: Do beter
      const user = new User(userId);
      const player = new HumanPlayer(user, socket);

      gameService.createOrJoinGame(gameId, player);
    }
  );

  /**
   * Leave game
   */
  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/leave',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.leaveGame(gameId, new User(userId));
      return { success: true };
    }
  );

  /**
   * Start game
   */
  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/start',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema }),
        response: successResponseSchema,
      },
    },
    async function (request, _reply) {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string; // TODO: Do beter
      const user = new User(userId);
      await gameService.startGame(gameId, user);
      return { success: true };
    }
  );

  /**
   * Cancel game
   */
  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/cancel',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.cancelGame(gameId, new User(userId));
      return { success: true };
    }
  );

  /**
   * Skip to next round in game
   */
  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/skipRound',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.skipToNextRound(gameId, new User(userId));
      return { success: true };
    }
  );

  /**
   * Remove player from game
   */
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/game/:gameId/player/:playerUserId',
    {
      schema: {
        params: z.strictObject({
          gameId: gameIdSchema,
          playerUserId: userIdSchema,
        }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.removePlayer(gameId, new User(userId), new User(playerUserId));
      return { success: true };
    }
  );

  /**
   * Add non-human player to game
   */
  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/player/:playerUserId',
    {
      schema: {
        params: z.strictObject({
          gameId: gameIdSchema,
          playerUserId: userIdSchema,
        }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.addNonHumanPlayer(gameId, new User(userId), new User(playerUserId));
      return { success: true };
    }
  );

  /**
   * Update game config
   */
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/game/:gameId/config',
    {
      schema: {
        params: z.strictObject({
          gameId: gameIdSchema,
        }),
        body: z.strictObject({
          updates: gameSettingsSchema.partial(),
        }),
        response: getResponseSchema(gameSettingsSchema),
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const { updates } = request.body;
      const userId = request.headers['x-user-id'] as string;
      return gameService.updateGameConfig(gameId, new User(userId), updates);
    }
  );

  /**
   * Delete game
   */
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/game/:gameId',
    {
      schema: {
        params: z.strictObject({
          gameId: gameIdSchema,
        }),
        response: successResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const userId = request.headers['x-user-id'] as string;
      gameService.deleteGame(gameId, new User(userId));
      return { success: true };
    }
  );

  // PRIVATE METHODS FOLLOW...

  function getResponseSchema(successSchema: ZodSchema): Record<number, ZodSchema> {
    return {
      200: successSchema,
      500: z.any(), // TODO: Expand or make better?
    };
  }
}
