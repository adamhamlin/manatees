import 'fastify';

/**
 * Not sure why the declaration merging with node_modules/fastify-esso/index.d.ts is not working
 * automatically, typescript finds the file... So just duplicating.
 */
declare module 'fastify' {
  interface FastifyRequest {
    auth: {
      userId: string;
      expiresAt: Date;
      tokenHash: string;
    };
  }

  interface FastifyInstance {
    generateAuthToken: (arg: Pick<FastifyRequest['auth'], 'userId' | 'expiresAt'>) => Promise<string>;
    requireAuthentication: (arg: FastifyInstance) => void;
  }
}
