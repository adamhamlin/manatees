interface ReverseSempaphore<T> {
  /**
   * Wait for the semaphore condition to be satisfied
   */
  wait(): Promise<T>;
  /**
   * Inform the semaphore of progress toward satisfying the condition
   */
  signal(...args: unknown[]): void;
  /**
   * Reset the semaphore to initial state
   */
  reset(): void;
}

abstract class BaseReverseSempaphore<T> implements ReverseSempaphore<T> {
  protected promiseResolver: (arg: T) => void;
  private promise: Promise<T>;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.promiseResolver = () => {}; // make types happy before we overwrite below
    this.promise = this.getPromise();
  }

  async wait(): Promise<T> {
    return this.promise;
  }

  abstract signal(...args: unknown[]): void;

  reset(): void {
    this.promise = this.getPromise();
  }

  private getPromise(): Promise<T> {
    return new Promise((resolve) => {
      this.promiseResolver = resolve;
    });
  }
}

export class SimpleReverseSempaphore<T> extends BaseReverseSempaphore<T> {
  signal(result: T): void {
    this.promiseResolver(result);
  }
}

export class MappedReverseSemaphore<K extends PropertyKey, V> extends BaseReverseSempaphore<Map<K,V>> {
  private readonly expectedMapKeys: Set<K>;
  private readonly resultMap: Map<K, V>;

  constructor(private getKeysFn: () => K[]) {
    super();
    this.expectedMapKeys = new Set(this.getKeysFn());
    this.resultMap = new Map();
  }

  signal(key: K, value: V): void {
    if (!this.expectedMapKeys.has(key)) {
      throw new Error(`Key=${key.toString()} not part of keyset!`);
    }
    this.resultMap.set(key, value);

    if (this.isComplete()) {
      this.promiseResolver(this.resultMap);
    }
  }

  override reset(): void {
    this.expectedMapKeys.clear();
    this.getKeysFn().forEach((key) => this.expectedMapKeys.add(key));
    this.resultMap.clear();
    super.reset();
  }

  private isComplete(): boolean {
    return this.resultMap.size === this.expectedMapKeys.size;
  }
}

