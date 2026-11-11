import { environment } from '../environment';

export function hasSessionToken(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${environment.apiAuthCookieName}=`));
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${environment.apiAuthCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;

  if (window.location.pathname === '/login') {
    return;
  }

  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/login?redirectTo=${encodeURIComponent(currentUrl)}`);
}
