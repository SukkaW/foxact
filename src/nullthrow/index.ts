/** @see https://foxact.skk.moe/invariant-nullthrow */
export const nullthrow = <T>(value: T, message = 'Value is null or undefined'): NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
};
