// https://github.com/pmndrs/jotai/blob/2188d7557500e59c10415a9e74bb5cfc8a3f9c31/src/react/useAtomValue.ts#L13-L42

// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- check if React.use is available
import reactExports from 'react';

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- React.use polyfill
export const use = typeof reactExports.use === 'function'
  ? reactExports.use
  // the polyfill arm is unreachable when testing against React 19+ (the capability
  // is sniffed once at module load), hence the istanbul ignore
  : /* istanbul ignore next */ (<T>(
    promise: Promise<T> & {
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
        // eslint-disable-next-line promise/catch-or-return, promise/prefer-catch -- React.use
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
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- React.use
        throw promise;
      }
    }
  });
