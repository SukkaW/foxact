/** @see https://foxact.skk.moe/invariant-nullthrow */
export function invariant<T>(value: T, message = '[foxact/invariant] "value" is null or undefined'): asserts value is NonNullable<T> {
  // eslint-disable-next-line sukka/prefer-nullthrow -- this function defines foxact/invariant
  if (value === null || value === undefined) {
    throw new TypeError(message);
  }
}
