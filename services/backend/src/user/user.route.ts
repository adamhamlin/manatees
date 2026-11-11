import { userWithProfileSchema } from '@manatees/shared/types';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'super-simple-fastify-server';
import { z } from 'zod';

import { AuthService } from '@auth/auth.service';
import { getZodResponseSchema, zodSuccessResponseSchema } from '@common/utils/utils';

import { UserService } from './user.service';

const userService = new UserService();

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // Set up auth for these routes
  app.requireAuthentication(app);

  /**
   * Get current user identity
   */
  app.withTypeProvider<ZodTypeProvider>().get(
    '/user/self',
    {
      schema: {
        response: getZodResponseSchema(userWithProfileSchema),
      },
    },
    async (request, _reply) => {
      return userService.getProfileOrThrow(request.auth.userId);
    }
  );

  app.withTypeProvider<ZodTypeProvider>().patch(
    '/user/self',
    {
      schema: {
        body: z.strictObject({ displayName: z.string().trim().min(1).max(80).nullable().optional() }),
        response: getZodResponseSchema(userWithProfileSchema),
      },
    },
    async (request, _reply) => userService.updateUserProfile(request.auth.userId, request.body)
  );

  /**
   * Logout
   */
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/user/logout',
    {
      schema: {
        response: zodSuccessResponseSchema,
      },
    },
    async (request, _reply) => {
      await AuthService.getInstance().invalidateToken(request.auth.tokenHash);
      return { success: true };
    }
  );
}
