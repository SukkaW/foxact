export interface Noop {
  (...args: any[]): any
}

/** @see https://foxact.skk.moe/noop */
export const noop: Noop = () => { /* noop */ };
