import type { FastifyRequest } from 'fastify';
import { z, ZodSchema } from 'zod';

import { User } from '@user/user';
import { UserService } from '@user/user.service';

const userService = new UserService();

export async function getUser(request: FastifyRequest): Promise<User> {
  return userService.getUserOrThrow(request.auth.userId);
}

export function getZodResponseSchema(successSchema: ZodSchema): Record<number, ZodSchema> {
  return {
    200: successSchema,
    500: z.any(), // TODO: Expand or make better?
  };
}

export const zodSuccessResponseSchema = getZodResponseSchema(z.strictObject({ success: z.literal(true) }));
