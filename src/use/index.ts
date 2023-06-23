/// <reference types="react/experimental" />

// https://github.com/pmndrs/jotai/blob/2188d7557500e59c10415a9e74bb5cfc8a3f9c31/src/react/useAtomValue.ts#L13-L42

import reactExports from 'react';

export const use
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, import/no-named-as-default-member -- see above
  = reactExports.use
  || (<T>(
    promise: PromiseLike<T> & {
      status?: 'pending' | 'fulfilled' | 'rejected',
      value?: T,
      reason?: unknown
    }
  ): T => {
    if (promise.status === 'pending') {
      throw promise;
    } else if (promise.status === 'fulfilled') {
      return promise.value as T;
    } else if (promise.status === 'rejected') {
      throw promise.reason;
    } else {
      promise.status = 'pending';
      promise.then(
        (v) => {
          promise.status = 'fulfilled';
          promise.value = v;
        },
        (e) => {
          promise.status = 'rejected';
          promise.reason = e;
        }
      );
      throw promise;
    }
  });
