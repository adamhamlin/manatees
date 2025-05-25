import fastifySensible from '@fastify/sensible';
import fastifyWebsocket from '@fastify/websocket';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { FastifyInstance, SimpleFastifyServer } from 'super-simple-fastify-server';

import { configuration } from './app.config';
import { gameRoutes } from './game/game.route';
import { ManateesError } from './utils/errors';
import { setLogger } from './utils/logger';

/**
 * Start up the Manatees server
 */
export async function startServer(): Promise<void> {
  const serverOptions = {
    hostname: configuration.server.hostname,
    port: configuration.server.port
  };
  const server = new SimpleFastifyServer(async (fastify: FastifyInstance) => {
    // Make logger available everywhere
    setLogger(fastify.log);

    // Set Zod as schema validation tool
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // REST error handling
    fastify.setErrorHandler((error, _request, _reply) => {
      if (error instanceof ManateesError) {
        // Make our errors http-friendly
        throw fastify.httpErrors.createError(error.statusCode, error);
      } else {
        throw error;
      }
    });

    fastify.log.info('Loading all plugins...');
    await fastify.register(fastifySensible, { sharedSchemaId: 'false' });
    await fastify.register(fastifyWebsocket, {
      errorHandler: function (error, socket, _request, _reply) {
        fastify.log.error(`WebSocket error`, error);
        socket.send(`Error: ${error.message}`);
        socket.terminate(); // TODO: Is this what we want?
      },
      options: {
        maxPayload: configuration.server.webSocket.maxPayloadSizeBytes,
        verifyClient: function (info, next) {
          if (!info.req.headers['x-user-id']) {
            // TODO: Not sure this message is acually getting sent back...?
            return next(false, 401, 'Must specify playerId in x-user-id header');
          }
          next(true);
        },
      },
    });

    fastify.log.info('Loading all routes...');
    await fastify.register(gameRoutes);
  }, serverOptions);

  server.start().catch((err: unknown) => {
    throw err;
  });
}
