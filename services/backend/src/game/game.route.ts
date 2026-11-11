import { gameSettingsSchema, gameIdSchema, gameSummarySchema, userIdSchema } from '@manatees/shared/types';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'super-simple-fastify-server';
import { z } from 'zod';

import { getUser, getZodResponseSchema, zodSuccessResponseSchema } from '@common/utils/utils';

import { gameEventChannel, GameEvents } from './events/event.internal';
import { GameService } from './game.service';
import { HumanPlayer } from './player/player.human';

const gameService = new GameService(); // TODO: Dependency injection?

export async function gameRoutes(app: FastifyInstance): Promise<void> {
  // Set up auth for these routes
  app.requireAuthentication(app);

  /**
   * Get all current games
   */
  app.withTypeProvider<ZodTypeProvider>().get(
    '/game',
    {
      schema: {
        response: getZodResponseSchema(
          z.strictObject({
            games: z.array(gameSummarySchema),
          })
        ),
      },
    },
    async (_request, _reply) => {
      return { games: await gameService.getGamesList() };
    }
  );

  /**
   * Server-sent events: pings whenever the games list may have changed. Clients refetch GET /game.
   */
  app.get('/lobby/events', async (request, reply) => {
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 3000\n\n');

    // Coalesce bursts (e.g. a player leaving + admin re-election) into one ping
    let pending: NodeJS.Timeout | undefined;
    const onGamesChanged = (): void => {
      pending ??= setTimeout(() => {
        pending = undefined;
        res.write('event: gamesChanged\ndata: {}\n\n');
      }, 100);
    };
    const heartbeat = setInterval(() => res.write(': keepalive\n\n'), 25_000);
    gameEventChannel.on(GameEvents.GAMES_CHANGED, onGamesChanged);

    request.raw.on('close', () => {
      clearInterval(heartbeat);
      clearTimeout(pending);
      gameEventChannel.off(GameEvents.GAMES_CHANGED, onGamesChanged);
    });
  });

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
    async (socket, request) => {
      const { gameId } = request.params;
      const user = await getUser(request);
      const player = new HumanPlayer(user, socket);

      await gameService.createOrJoinGame(gameId, player);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const user = await getUser(request);
      await gameService.leaveGame(gameId, user);
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
        response: zodSuccessResponseSchema,
      },
    },
    async function (request, _reply) {
      const { gameId } = request.params;
      const user = await getUser(request);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const user = await getUser(request);
      await gameService.cancelGame(gameId, user);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const user = await getUser(request);
      await gameService.skipToNextRound(gameId, user);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.removePlayer(gameId, user, playerUserId);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    '/game/:gameId/player/:playerUserId/admit',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema, playerUserId: userIdSchema }),
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.approvePlayerJoin(gameId, user, playerUserId);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/game/:gameId/player/:playerUserId/join-request',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema, playerUserId: userIdSchema }),
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.rejectPlayerJoin(gameId, user, playerUserId);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/game/:gameId/player/:playerUserId/score',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema, playerUserId: userIdSchema }),
        body: z.strictObject({
          newScore: z.number().int(),
        }),
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.changePlayerScore(gameId, user, playerUserId, request.body.newScore);
      return { success: true };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/game/:gameId/player/:playerUserId/auto-play',
    {
      schema: {
        params: z.strictObject({ gameId: gameIdSchema, playerUserId: userIdSchema }),
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.autoPlayPlayer(gameId, user, playerUserId);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId, playerUserId } = request.params;
      const user = await getUser(request);
      await gameService.addNonHumanPlayer(gameId, user, playerUserId);
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
        response: getZodResponseSchema(gameSettingsSchema),
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const { updates } = request.body;
      const user = await getUser(request);
      return gameService.updateGameConfig(gameId, user, updates);
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
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      const { gameId } = request.params;
      const user = await getUser(request);
      await gameService.deleteGame(gameId, user);
      return { success: true };
    }
  );
}
