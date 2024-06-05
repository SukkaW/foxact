/* eslint-disable ssr-friendly/no-dom-globals-in-module-scope -- polyfilllg */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- polyfill */

/** @see https://foxact.skk.moe/request-idle-callback */
export const requestIdleCallback = (
  typeof self !== 'undefined'
    && self.requestIdleCallback
    && self.requestIdleCallback.bind(self)
) || function (cb: IdleRequestCallback): number {
  const start = Date.now();
  return self.setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1);
};

/** @see https://foxact.skk.moe/request-idle-callback */
export const cancelIdleCallback = (
  typeof self !== 'undefined'
    && self.cancelIdleCallback
    && self.cancelIdleCallback.bind(self)
) || function (id: number) {
  return clearTimeout(id);
};
