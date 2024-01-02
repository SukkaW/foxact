// TODO: https://github.com/microsoft/TypeScript/issues/40562

/** @see https://foxact.skk.moe/invariant-nullthrow */
export const nullthrow = <T>(value: T, message = '[foxact/invariant] "value" is null or undefined'): NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new TypeError(message);
  }
  return value;
};
