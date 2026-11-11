import {
  apiErrorCodes,
  type ApiErrorCode,
  type BlackCardInput,
  type CustomDeckWithCards,
  type CustomDeckInput,
  type DeckWithCards,
  type DeckSearchHit,
  type GameSettings,
  type GameSummary,
  type UserWithProfile,
  type WhiteCardInput,
} from '@manatees/shared/types';

import { environment } from '$lib/environment';
import { redirectToLogin } from '$lib/utils/session-utils';
import { showErrorToast } from '$lib/utils/toast.utils';

import { goto } from '$app/navigation';

export type ApiError = {
  statusCode: number;
  code?: ApiErrorCode;
  message: string;
};

// Callers receive an ApiResult and decide how to handle a failure.
export type ApiResult<T> = { data: T; success: true } | { success: false; error: ApiError };

type RequestBaseOptions = Omit<RequestInit, 'method' | 'body'> & {
  urlPath: string;
  failureMessagePrefix?: string;
};

type RequestOptions =
  | (RequestBaseOptions & { method: 'GET'; body?: never })
  | (RequestBaseOptions & { method: 'POST' | 'PUT' | 'PATCH'; body: BodyInit })
  | (RequestBaseOptions & { method: 'DELETE'; body?: BodyInit });

const jsonHeaders = { 'content-type': 'application/json' };

function gamePath(gameId: string): string {
  return `/game/${encodeURIComponent(gameId)}`;
}

class ApiClient {
  static readonly instance = new ApiClient();

  private constructor() {
    // no-op
  }

  /** Dev-only; backend rejects unless MANATEES_ALLOW_DEV_LOGINS is enabled. */
  devLogin(name: string, redirectTo: string): Promise<ApiResult<{ redirectTo: string }>> {
    return this.request({
      urlPath: '/auth/dev-login',
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name, redirectTo }),
    });
  }

  logoutUser(): Promise<ApiResult<{ success: true }>> {
    return this.request({ urlPath: '/user/logout', method: 'DELETE' });
  }

  getCurrentUser(): Promise<ApiResult<UserWithProfile>> {
    return this.request({ urlPath: '/user/self', method: 'GET' });
  }

  updateUserProfile(updates: { displayName?: string | null }): Promise<ApiResult<UserWithProfile>> {
    return this.request({
      urlPath: '/user/self',
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(updates),
    });
  }

  getGames(): Promise<ApiResult<{ games: GameSummary[] }>> {
    return this.request({ urlPath: '/game', method: 'GET' });
  }

  getDecks(): Promise<ApiResult<{ decks: DeckSearchHit[] }>> {
    return this.request({ urlPath: '/cards/decks', method: 'GET' });
  }

  getOwnedDecks(): Promise<ApiResult<{ decks: DeckSearchHit[] }>> {
    return this.request({ urlPath: '/cards/decks/mine', method: 'GET' });
  }

  getDeckById(deckId: number): Promise<ApiResult<DeckWithCards>> {
    return this.request({ urlPath: `/cards/decks/${deckId}`, method: 'GET' });
  }

  createCustomDeck(input: CustomDeckInput): Promise<ApiResult<CustomDeckWithCards>> {
    return this.request({
      urlPath: '/cards/decks',
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
  }

  updateCustomDeck(deckId: number, updates: Partial<CustomDeckInput>): Promise<ApiResult<CustomDeckWithCards>> {
    return this.request({
      urlPath: `/cards/decks/${deckId}`,
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(updates),
    });
  }

  deleteCustomDeck(deckId: number): Promise<ApiResult<{ success: true }>> {
    return this.request({ urlPath: `/cards/decks/${deckId}`, method: 'DELETE' });
  }

  getDecksWithCardText(
    type: 'white' | 'black',
    content: string,
    excludeDeckId?: number
  ): Promise<ApiResult<{ deckNames: string[] }>> {
    const query = new URLSearchParams({ type, content });
    if (excludeDeckId !== undefined) {
      query.set('excludeDeckId', String(excludeDeckId));
    }
    return this.request({ urlPath: `/cards/card-text-decks?${query}`, method: 'GET' });
  }

  createWhiteCard(
    deckId: number,
    input: WhiteCardInput
  ): Promise<ApiResult<{ id: number; content: string; deckId: number }>> {
    return this.request({
      urlPath: `/cards/decks/${deckId}/white-cards`,
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
  }

  updateWhiteCard(deckId: number, cardId: number, input: WhiteCardInput): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `/cards/decks/${deckId}/white-cards/${cardId}`,
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
  }

  deleteWhiteCard(deckId: number, cardId: number): Promise<ApiResult<{ success: true }>> {
    return this.request({ urlPath: `/cards/decks/${deckId}/white-cards/${cardId}`, method: 'DELETE' });
  }

  createBlackCard(
    deckId: number,
    input: BlackCardInput
  ): Promise<ApiResult<{ id: number; content: string; pickCount: number; deckId: number }>> {
    return this.request({
      urlPath: `/cards/decks/${deckId}/black-cards`,
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
  }

  updateBlackCard(deckId: number, cardId: number, input: BlackCardInput): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `/cards/decks/${deckId}/black-cards/${cardId}`,
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
  }

  deleteBlackCard(deckId: number, cardId: number): Promise<ApiResult<{ success: true }>> {
    return this.request({ urlPath: `/cards/decks/${deckId}/black-cards/${cardId}`, method: 'DELETE' });
  }

  updateGameConfig(gameId: string, updates: Partial<GameSettings>): Promise<ApiResult<GameSettings>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/config`,
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ updates }),
    });
  }

  startGame(gameId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/start`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  deleteGame(gameId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({ urlPath: gamePath(gameId), method: 'DELETE' });
  }

  cancelGame(gameId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/cancel`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  skipToNextRound(gameId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/skipRound`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  leaveGame(gameId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/leave`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  addPlayer(gameId: string, playerId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  removePlayer(gameId: string, playerId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}`,
      method: 'DELETE',
    });
  }

  approvePlayerJoin(gameId: string, playerId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}/admit`,
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  rejectPlayerJoin(gameId: string, playerId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}/join-request`,
      method: 'DELETE',
    });
  }

  changePlayerScore(gameId: string, playerId: string, newScore: number): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}/score`,
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ newScore }),
    });
  }

  autoPlayPlayer(gameId: string, playerId: string): Promise<ApiResult<{ success: true }>> {
    return this.request({
      urlPath: `${gamePath(gameId)}/player/${encodeURIComponent(playerId)}/auto-play`,
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({}),
    });
  }

  private async request<T>(options: RequestOptions): Promise<ApiResult<T>> {
    const { urlPath, failureMessagePrefix, ...requestInit } = options;
    const url = `${environment.apiUrl}${urlPath}`;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...requestInit,
      });

      if (response.status === 401) {
        redirectToLogin();
      }

      if (response.ok) {
        const data = (await response.json()) as T;
        return { data, success: true };
      }

      const text = await response.text();
      let message = text || response.statusText || 'Request failed';
      let code: ApiErrorCode | undefined;

      try {
        const parsed = JSON.parse(text) as { message?: string; code?: ApiErrorCode };
        message = parsed.message ?? message;
        code = parsed.code;
      } catch {
        // ignore parse errors and fall back to raw text
      }
      message = failureMessagePrefix ? `${failureMessagePrefix}: ${message}` : message;
      showErrorToast(message);
      if (code === apiErrorCodes.GAME_NOT_FOUND) {
        void goto('/lobby');
      }

      return { success: false, error: { statusCode: response.status, code, message } };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Request failed';
      const message = failureMessagePrefix ? `${failureMessagePrefix}: ${reason}` : reason;
      showErrorToast(message);

      return { success: false, error: { statusCode: -1, message } };
    }
  }
}

export const apiClient = ApiClient.instance;
