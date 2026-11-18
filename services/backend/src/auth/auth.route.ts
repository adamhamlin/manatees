import type { CookieSerializeOptions } from '@fastify/cookie';
import { getEnvVarValueOrThrow } from '@manatees/shared/utils/misc.utils';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'super-simple-fastify-server';
import { z } from 'zod';

import { UnauthorizedError } from '@common/utils/errors';

import { AuthService, type GoogleLoginTransaction } from './auth.service';

const LOGIN_TRANSACTION_COOKIE = 'MANATEES_GOOGLE_LOGIN';
const LOGIN_TRANSACTION_MAX_AGE_SECONDS = 10 * 60;
const DEFAULT_REDIRECT = '/lobby';

type StoredTransaction = GoogleLoginTransaction & { redirectTo: string };

/** Only allow same-origin relative paths to avoid open redirects. */
function safeRedirectPath(value: string | undefined): string {
  return value && /^\/(?![/\\])/.test(value) ? value : DEFAULT_REDIRECT;
}

function cookieOptions(maxAge: number): CookieSerializeOptions {
  const isHttps = new URL(getEnvVarValueOrThrow('GOOGLE_REDIRECT_URI')).protocol === 'https:';
  // Lax so the cookies are sent on Google's top-level redirect back to us
  return { path: '/', httpOnly: true, sameSite: 'lax', secure: isHttps, maxAge };
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Begin Google sign-in: redirect the browser to Google's consent screen
   */
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/auth/google',
      { schema: { querystring: z.object({ redirectTo: z.string().optional() }) } },
      async (request, reply) => {
        const { url, transaction } = await AuthService.getInstance().startGoogleLogin();
        const stored: StoredTransaction = { ...transaction, redirectTo: safeRedirectPath(request.query.redirectTo) };
        reply.setCookie(
          LOGIN_TRANSACTION_COOKIE,
          Buffer.from(JSON.stringify(stored)).toString('base64url'),
          cookieOptions(LOGIN_TRANSACTION_MAX_AGE_SECONDS)
        );
        return reply.redirect(url);
      }
    );

  /**
   * Google redirects back here with an authorization code
   */
  app.get('/auth/google/callback', async (request, reply) => {
    const raw = request.cookies?.[LOGIN_TRANSACTION_COOKIE];
    reply.clearCookie(LOGIN_TRANSACTION_COOKIE, { path: '/' });
    if (typeof raw !== 'string') {
      app.log.error(
        `Expected cookie named ${LOGIN_TRANSACTION_COOKIE}, but received ${JSON.stringify(request.cookies)}`
      );
      throw new UnauthorizedError();
    }

    let stored: StoredTransaction;
    try {
      stored = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as StoredTransaction;
    } catch {
      app.log.error(`Could not parse/decode ${LOGIN_TRANSACTION_COOKIE} cookie`);
      throw new UnauthorizedError();
    }
    if (!stored.state || !stored.nonce || !stored.codeVerifier) {
      app.log.error(`Cookie ${LOGIN_TRANSACTION_COOKIE} was missing one or more of: state, nonce, codeVerifier`);
      throw new UnauthorizedError();
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(request.query as Record<string, unknown>)) {
      if (typeof value === 'string') {
        params.set(key, value);
      }
    }

    const authService = AuthService.getInstance();
    const user = await authService.completeGoogleLogin(params, stored);

    const { cookieName, expiresAt, maxAgeSeconds } = authService.getSessionInfo();
    const token = await app.generateAuthToken({ userId: user.id, expiresAt });
    // Not httpOnly: the frontend checks for this cookie's presence to detect a session
    reply.setCookie(cookieName, token, { ...cookieOptions(maxAgeSeconds), httpOnly: false });
    return reply.redirect(safeRedirectPath(stored.redirectTo));
  });

  if (process.env.MANATEES_ALLOW_DEV_LOGINS === 'true') {
    app.log.warn('MANATEES_ALLOW_DEV_LOGINS is enabled: POST /auth/dev-login skips Google sign-in');
    app.withTypeProvider<ZodTypeProvider>().post(
      '/auth/dev-login',
      {
        schema: {
          body: z.object({ name: z.string().trim().min(1).max(80), redirectTo: z.string().optional() }),
        },
      },
      async (request, reply) => {
        const authService = AuthService.getInstance();
        const user = await authService.devLogin(request.body.name);

        const { cookieName, expiresAt, maxAgeSeconds } = authService.getSessionInfo();
        const token = await app.generateAuthToken({ userId: user.id, expiresAt });
        reply.setCookie(cookieName, token, { ...cookieOptions(maxAgeSeconds), httpOnly: false });
        return { redirectTo: safeRedirectPath(request.body.redirectTo) };
      }
    );
  }
}
