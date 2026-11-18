import type { UserWithProfile } from '@manatees/shared/types';
import { get, writable } from 'svelte/store';

import { apiClient } from '$lib/api/api-client';
import { redirectToLogin } from '$lib/utils/session-utils';

export const currentUser = writable<UserWithProfile | undefined>(undefined);

let currentUserRequest: Promise<UserWithProfile | undefined> | undefined;

export function clearCurrentUser(): void {
  currentUser.set(undefined);
  currentUserRequest = undefined;
}

export async function getCurrentUser(): Promise<UserWithProfile | undefined> {
  const cachedUser = get(currentUser);
  if (cachedUser !== undefined) {
    return cachedUser;
  }

  if (currentUserRequest) {
    return currentUserRequest;
  }

  currentUserRequest = (async (): Promise<UserWithProfile | undefined> => {
    try {
      const result = await apiClient.getCurrentUser();
      if (!result.success) {
        currentUser.set(undefined);
        if (result.error.statusCode === 404) {
          // Browser got into a weird state, need to clear cookies
          redirectToLogin();
        }
        return undefined;
      }

      currentUser.set(result.data);
      return result.data;
    } catch {
      currentUser.set(undefined);
      return undefined;
    } finally {
      currentUserRequest = undefined;
    }
  })();

  return currentUserRequest;
}
