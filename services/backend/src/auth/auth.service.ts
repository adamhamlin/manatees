import { getEnvVarValueOrThrow } from '@manatees/shared/utils/misc.utils';
import dayjs from 'dayjs';
import { FastifyBaseLogger, FastifyRequest } from 'fastify';
import * as oidc from 'openid-client';
import { z } from 'zod';

import { TokenExpiredError, UnauthorizedError } from '@common/utils/errors';
import { LOGGER } from '@common/utils/logger';

import { AuthRepository } from './auth.repository';
import { UserService } from '../user/user.service';

export type GoogleLoginTransaction = { state: string; nonce: string; codeVerifier: string };

export class AuthService {
  static readonly #USER_SESSION_TOKEN_NAME = 'MANATEES_USER_SESSION_TOKEN';
  static readonly #USER_SESSION_TOKEN_MAX_AGE_SECONDS = 4 * 60 * 60; // 4 hours
  static readonly #GOOGLE_CLIENT_ID = getEnvVarValueOrThrow('GOOGLE_CLIENT_ID');
  static readonly #GOOGLE_CLIENT_SECRET = getEnvVarValueOrThrow('GOOGLE_CLIENT_SECRET');
  static readonly #GOOGLE_REDIRECT_URI = getEnvVarValueOrThrow('GOOGLE_REDIRECT_URI');

  static #instance: AuthService | undefined;

  readonly #userService: UserService;
  readonly #authRepository: AuthRepository;
  readonly #logger: FastifyBaseLogger;

  private constructor() {
    this.#userService = new UserService();
    this.#authRepository = new AuthRepository();
    this.#logger = LOGGER.child({}, { msgPrefix: '[AuthLog] >> ' });
  }

  #googleConfig: Promise<oidc.Configuration> | undefined;

  #getGoogleConfig(): Promise<oidc.Configuration> {
    // Discovery result is cached; reset on failure so a transient error isn't permanent
    this.#googleConfig ??= oidc
      .discovery(
        new URL('https://accounts.google.com'),
        AuthService.#GOOGLE_CLIENT_ID,
        AuthService.#GOOGLE_CLIENT_SECRET
      )
      .catch((error) => {
        this.#googleConfig = undefined;
        throw error;
      });
    return this.#googleConfig;
  }

  /** Build the Google authorization URL plus the secrets that must survive until the callback. */
  async startGoogleLogin(): Promise<{ url: string; transaction: GoogleLoginTransaction }> {
    const config = await this.#getGoogleConfig();
    const transaction = {
      state: oidc.randomState(),
      nonce: oidc.randomNonce(),
      codeVerifier: oidc.randomPKCECodeVerifier(),
    };
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: getEnvVarValueOrThrow('GOOGLE_REDIRECT_URI'),
      scope: 'openid email profile',
      state: transaction.state,
      nonce: transaction.nonce,
      code_challenge: await oidc.calculatePKCECodeChallenge(transaction.codeVerifier),
      code_challenge_method: 'S256',
    });
    return { url: url.href, transaction };
  }

  /** Exchange the callback code, verify the ID token, and find/create the matching user. */
  async completeGoogleLogin(
    callbackParams: URLSearchParams,
    transaction: GoogleLoginTransaction
  ): Promise<{ id: string }> {
    const config = await this.#getGoogleConfig();
    // Built from config (not the request) since proxies may rewrite the Host header
    const currentUrl = new URL(AuthService.#GOOGLE_REDIRECT_URI);
    currentUrl.search = callbackParams.toString();

    let claims: oidc.IDToken | undefined;
    try {
      const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
        pkceCodeVerifier: transaction.codeVerifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
      });
      claims = tokens.claims();
    } catch (err) {
      this.#logger.error(err, 'Error while fetching claims');
      throw new UnauthorizedError();
    }

    // Validate the claims shape, the types are minimally constrained
    const { sub, name, email, email_verified } = z
      .object({
        sub: z.string().trim().min(1),
        name: z.string().trim().min(1),
        email: z.string().trim().min(1),
        email_verified: z.boolean(),
      })
      .parse(claims, {
        error: (issue) => `Google claims object failed to parse as expected: ${issue.message}`,
      });

    if (!email_verified) {
      this.#logger.error('Claims email was unverified');
      throw new UnauthorizedError();
    }

    const user = await this.#userService.upsertFromGoogle({
      googleSub: sub,
      email,
      name,
    });
    return { id: user.id };
  }

  /** Dev-only login that skips Google; callers must check the dev-login flag. */
  async devLogin(name: string): Promise<{ id: string }> {
    const user = await this.#userService.upsertFromDevLogin(name);
    return { id: user.id };
  }

  getSessionInfo(): { cookieName: string; maxAgeSeconds: number; expiresAt: Date } {
    const maxAgeSeconds = AuthService.#USER_SESSION_TOKEN_MAX_AGE_SECONDS;
    return {
      cookieName: AuthService.#USER_SESSION_TOKEN_NAME,
      maxAgeSeconds,
      expiresAt: dayjs().add(maxAgeSeconds, 'seconds').toDate(),
    };
  }

  async validateRequestAuth(auth: FastifyRequest['auth']): Promise<void> {
    if (!auth.tokenHash || dayjs().isAfter(dayjs(auth.expiresAt))) {
      throw new TokenExpiredError();
    }

    if (await this.#authRepository.isTokenInvalidated(auth.tokenHash)) {
      throw new TokenExpiredError();
    }
  }

  async invalidateToken(tokenHash: string): Promise<void> {
    await this.#authRepository.invalidateToken(tokenHash);
  }

  static getCredentialName(): string {
    return AuthService.#USER_SESSION_TOKEN_NAME;
  }

  static getInstance(): AuthService {
    if (!AuthService.#instance) {
      AuthService.#instance = new AuthService();
    }
    return AuthService.#instance;
  }
}
