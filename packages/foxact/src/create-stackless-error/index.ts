const stlProp = Object.getOwnPropertyDescriptor(
  Error,
  'stackTraceLimit'
);
const hasSTL = stlProp?.writable && typeof stlProp.value === 'number';

export function createStacklessError<T = Error>(errorFacrory: () => T): T {
  const originalStackTraceLimit = Error.stackTraceLimit;

  /**
   * This is *only* safe to do when we know that nothing at any point in the
   * stack relies on the `Error.stack` property of the noSSRError. By removing
   * the strack trace of the error, we can improve the performance of object
   * creation by a lot.
   */
  if (hasSTL) {
    Error.stackTraceLimit = 0;
  }

  const error = errorFacrory();

  /**
   * Restore the stack trace limit to its original value after the error has
   * been created.
   */
  if (hasSTL) {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  return error;
}
