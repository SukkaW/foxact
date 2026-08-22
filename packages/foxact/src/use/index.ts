// https://github.com/pmndrs/jotai/blob/2188d7557500e59c10415a9e74bb5cfc8a3f9c31/src/react/useAtomValue.ts#L13-L42

// eslint-disable-next-line no-restricted-imports -- the compatibility implementation must detect whether React.use exists
import * as reactExports from 'react';

// These mirror the `ReactPromise` family `@types/react` only ships with the React
// 19 typings, so that anything handing a pre-tracked thenable to `use()` (e.g.
// `foxact/browser`) can be typed the same way on React 18.
export interface UntrackedReactPromise<T> extends PromiseLike<T> {
  status?: undefined
}

export interface PendingReactPromise<T> extends PromiseLike<T> {
  status: 'pending'
}

export interface FulfilledReactPromise<T> extends PromiseLike<T> {
  status: 'fulfilled',
  value: T
}

export interface RejectedReactPromise<T> extends PromiseLike<T> {
  status: 'rejected',
  reason: unknown
}

/**
 * A thenable whose settled state React's `use()` reads synchronously, off the
 * `status` / `value` / `reason` properties React attaches while tracking it.
 */
export type ReactPromise<T> =
  | UntrackedReactPromise<T>
  | PendingReactPromise<T>
  | FulfilledReactPromise<T>
  | RejectedReactPromise<T>;

// The tracking the polyfill performs itself: React mutates the very same
// properties in place, so the polyfill needs them writable.
interface TrackedReactPromise<T> extends PromiseLike<T> {
  status?: 'pending' | 'fulfilled' | 'rejected',
  value?: T,
  reason?: unknown
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- React.use polyfill
export const use = typeof reactExports.use === 'function'
  ? reactExports.use
  // the polyfill arm is unreachable when testing against React 19+ (the capability
  // is sniffed once at module load), hence the istanbul ignore
  : /* istanbul ignore next */ (<T>(usable: ReactPromise<T>): T => {
    const promise = usable as TrackedReactPromise<T>;

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
