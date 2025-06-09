// https://github.com/pmndrs/jotai/blob/2188d7557500e59c10415a9e74bb5cfc8a3f9c31/src/react/useAtomValue.ts#L13-L42

// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- check if React.use is available
import reactExports from 'react';

export const use
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above
  = reactExports.use
    || (<T>(
      promise: PromiseLike<T> & {
        status?: 'pending' | 'fulfilled' | 'rejected',
        value?: T,
        reason?: unknown
      }
    ): T => {
      switch (promise.status) {
        case 'pending': {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- React.use
          throw promise;
        }
        case 'fulfilled': {
          return promise.value as T;
        }
        case 'rejected': {
          throw promise.reason;
        }
        default: {
          promise.status = 'pending';
          // eslint-disable-next-line promise/catch-or-return -- React.use
          promise.catch((e) => {
            promise.status = 'rejected';
            promise.reason = e;
          }).then(
            (v) => {
              promise.status = 'fulfilled';
              promise.value = v;
            }
          );
          // eslint-disable-next-line @typescript-eslint/only-throw-error -- React.use
          throw promise;
        }
      }
    });
