export type EmptyObject = Record<string, never>;

export function assertExists<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be non-nullish${message ? `: ${message}` : ''}`);
  }
}