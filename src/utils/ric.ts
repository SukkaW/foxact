/* eslint-disable @typescript-eslint/no-unnecessary-condition -- polyfill */
/* eslint-disable no-restricted-globals -- polyfill */
export const requestIdleCallback = (
  typeof self !== 'undefined'
    && self.requestIdleCallback
    && self.requestIdleCallback.bind(self)
) || function (cb: IdleRequestCallback): number {
  const start = Date.now();
  // eslint-disable-next-line @fluffyfox/prefer-timer-id -- return instead
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1) as unknown as number;
};

export const cancelIdleCallback = (
  typeof self !== 'undefined'
    && self.cancelIdleCallback
    && self.cancelIdleCallback.bind(self)
) || function (id: number) {
  return clearTimeout(id);
};
