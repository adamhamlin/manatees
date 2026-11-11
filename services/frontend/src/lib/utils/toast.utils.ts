export const TOAST_EVENT_NAME = 'manatees:toast';
export const DISMISS_TOAST_EVENT_NAME = 'manatees:toast-dismiss';

export type ToastAction = { label: string; onClick: () => void };

function showToast(message: string, type: 'error' | 'success' | 'warning', key?: string, action?: ToastAction): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: { message, type, key, action } }));
}

export function showErrorToast(message: string, error?: unknown): void {
  const errorMessage = getErrorMessage(error);
  showToast(errorMessage ? `${message} ${errorMessage}` : message, 'error');
}

export function showSuccessToast(message: string): void {
  showToast(message, 'success');
}

export function showWarningToast(message: string, key: string, action?: ToastAction): void {
  showToast(message, 'warning', key, action);
}

export function dismissToast(key: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DISMISS_TOAST_EVENT_NAME, { detail: { key } }));
  }
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message || undefined;
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message || undefined;
  }

  return undefined;
}
