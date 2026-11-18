import { createHmac } from 'node:crypto';

import { fastifyCookie } from '@fastify/cookie';
import cors from '@fastify/cors';
import { fastifySensible } from '@fastify/sensible';
import { fastifyWebsocket } from '@fastify/websocket';
import { getEnvVarValueOrThrow } from '@manatees/shared/utils/misc.utils';
import { FastifyRequest } from 'fastify';
import fastifyEsso from 'fastify-esso';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { FastifyInstance, SimpleFastifyServer } from 'super-simple-fastify-server';

import { ManateesError, UnauthorizedError } from '@common/utils/errors';
import { setLogger } from '@common/utils/logger';

import { authRoutes } from './auth/auth.route';
import { AuthService } from './auth/auth.service';
import { cardsRoutes } from './cards/cards.route';
import { configuration } from './config/app.config';
import { gameRoutes } from './game/game.route';
import { userRoutes } from './user/user.route';

/**
 * Start up the Manatees server
 */
export async function startServer(): Promise<void> {
  const serverOptions = {
    hostname: configuration.server.hostname,
    port: configuration.server.port,
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

    const credentialName = getEnvVarValueOrThrow('MANATEES_CREDENTIAL_NAME');
    const authSecret = getEnvVarValueOrThrow('MANATEES_AUTH_SECRET');
    // The browser's origin once requests are proxied through ngrok
    const publicOrigin = new URL(getEnvVarValueOrThrow('GOOGLE_REDIRECT_URI')).origin;
    await fastify.register(
      fastifyEsso({
        // auth plugin
        secret: authSecret,
        header_name: credentialName,
        extra_validation: async (request: FastifyRequest, _reply) => {
          const credential = request.cookies?.[credentialName];
          if (typeof credential !== 'string') {
            throw new UnauthorizedError();
          }
          // Hash/attach the token so it can be used for session invalidation if needed
          request.auth.tokenHash = createHmac('sha256', authSecret).update(credential).digest('hex');
          // NOTE: Purposely not using `return` here to comply w/ fastify-esso expectations
          // See https://github.com/patrickpissurno/fastify-esso/issues/18#issuecomment-1421334134
          await AuthService.getInstance().validateRequestAuth(request.auth);
        },
      })
    );
    await fastify.register(cors, {
      origin: (origin, callback) => {
        if (!origin || origin === publicOrigin) {
          callback(null, true);
          return;
        }

        const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin);
        if (isLocalDevOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    await fastify.register(fastifyCookie, { secret: authSecret }); // for setting cookies (secret enables signed cookies)
    await fastify.register(fastifySensible, { sharedSchemaId: 'false' }); // error handling plugin
    await fastify.register(fastifyWebsocket, {
      // websocket plugin (duh)
      errorHandler: function (error, socket, _request, _reply) {
        fastify.log.error(error, `WebSocket error`);
        socket.send(`Error: ${error.message}`);
        socket.terminate(); // TODO: Is this what we want?
      },
      options: {
        maxPayload: configuration.server.webSocket.maxPayloadSizeBytes,
        verifyClient: function (_info, next) {
          // if (false && !info.req.headers['x-user-id']) {
          //   // TODO: Not sure this message is acually getting sent back...?
          //   return next(false, 401, 'Must specify playerId in x-user-id header');
          // }
          next(true);
        },
      },
    });

    fastify.log.info('Loading all routes...');
    await fastify.register(authRoutes);
    await fastify.register(userRoutes);
    await fastify.register(cardsRoutes);
    await fastify.register(gameRoutes);
  }, serverOptions);

  server.start().catch((err: unknown) => {
    throw err;
  });
}
