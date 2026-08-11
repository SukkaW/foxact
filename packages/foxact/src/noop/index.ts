export interface Noop {
  (...args: any[]): any
}

/** @see https://foxact.skk.moe/noop */
// eslint-disable-next-line sukka/prefer-foxts-noop -- this module defines foxact/noop
export const noop: Noop = () => { /* noop */ };
