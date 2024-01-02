/** @see https://foxact.skk.moe/invariant-nullthrow */
export function invariant<T>(value: T, message = '[foxact/invariant] "value" is null or undefined'): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new TypeError(message);
  }
}
