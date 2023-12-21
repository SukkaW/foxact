/** @see https://foxact.skk.moe/invariant-nullthrow */
export function invariant<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}
