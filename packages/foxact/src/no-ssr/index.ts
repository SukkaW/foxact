import { createStacklessError } from '../create-stackless-error';

/** @private */
export function noSSRError(errorMessage?: string, nextjsDigest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING') {
  const error = createStacklessError(() => new Error(errorMessage));

  // Next.js marks errors with `NEXT_DYNAMIC_NO_SSR_CODE` digest as recoverable:
  // https://github.com/vercel/next.js/blob/bef716ad031591bdf94058aaf4b8d842e75900b5/packages/next/src/shared/lib/lazy-dynamic/bailout-to-csr.ts#L2
  (error as any).digest = nextjsDigest;
  (error as any).recoverableError = 'NO_SSR';

  return error;
}

/** @see https://foxact.skk.moe/no-ssr */
export function noSSR(extraMessage?: string) {
  if (typeof window === 'undefined') {
    throw noSSRError(extraMessage);
  }
}
