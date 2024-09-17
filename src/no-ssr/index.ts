const stlProp = Object.getOwnPropertyDescriptor(
  Error,
  'stackTraceLimit'
);
const hasSTL = stlProp?.writable && typeof stlProp.value === 'number';

/** @private */
export const noSSRError = (errorMessage?: string, nextjsDigest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING') => {
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

  const error = new Error(errorMessage);

  /**
   * Restore the stack trace limit to its original value after the error has
   * been created.
   */
  if (hasSTL) {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  // Next.js marks errors with `NEXT_DYNAMIC_NO_SSR_CODE` digest as recoverable:
  // https://github.com/vercel/next.js/blob/bef716ad031591bdf94058aaf4b8d842e75900b5/packages/next/src/shared/lib/lazy-dynamic/bailout-to-csr.ts#L2
  (error as any).digest = nextjsDigest;

  (error as any).recoverableError = 'NO_SSR';

  return error;
};

/** @see https://foxact.skk.moe/no-ssr */
export const noSSR = (extraMessage?: string) => {
  if (typeof window === 'undefined') {
    throw noSSRError(extraMessage);
  }
};
