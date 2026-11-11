export type EmptyObject = Record<string, never>;

export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be non-nullish${message ? `: ${message}` : ''}`);
  }
}

export function assertCondition(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(`Expected condition to be truthy${message ? `: ${message}` : ''}`);
  }
}

export function getEnvVarValueOrThrow(varName: string): string {
  const val = process.env[varName];
  assertCondition(val, `${varName} must be set in environment`);
  return val;
}
