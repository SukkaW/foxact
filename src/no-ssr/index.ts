/** @see https://foxact.skk.moe/no-ssr */
export const noSSR = (extraMessage?: string) => {
  const error = new Error(extraMessage);

  // Next.js marks errors with `NEXT_DYNAMIC_NO_SSR_CODE` digest as recoverable:
  // https://github.com/vercel/next.js/blob/ded28edeae16f8f8b4b9b117a83b5232e3623029/packages/next/src/client/on-recoverable-error.ts#L3
  (error as any).digest = 'NEXT_DYNAMIC_NO_SSR_CODE';

  (error as any).recoverableError = 'NO_SSR';

  throw error;
};
