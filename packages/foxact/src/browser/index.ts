import * as reactDomExports from 'react-dom';

import { noSSRError } from '../no-ssr';
import type { FulfilledReactPromise, RejectedReactPromise } from '../use';

/**
 * Explains why the content has to render in the browser. It becomes the `cause`
 * of the error reported by the server renderer. A function is only invoked by
 * the server renderer and never in the browser, so pass one (e.g. `() => new
 * Error('...')`) when creating the reason is expensive.
 */
export type BrowserReason = string | (() => unknown);

/**
 * The opaque value returned by `browser()`. Pass it to `use()`, do not read
 * it, await it, or throw it yourself.
 */
export type BrowserUsable = FulfilledReactPromise<undefined> | RejectedReactPromise<undefined>;

// Same messages as React's own `browser()` implementation
const BROWSER_BAILOUT_MESSAGE = 'Browser-only rendering was requested by `browser()`.';
const REASON_INITIALIZER_THREW_MESSAGE = 'The reason for browser-only rendering could not be determined because its initializer threw.';

/** @private */
export function browserBailoutError(reason?: BrowserReason) {
  if (reason === undefined) {
    return noSSRError(BROWSER_BAILOUT_MESSAGE);
  }

  let cause: unknown;
  if (typeof reason === 'function') {
    try {
      cause = reason();
    } catch {
      cause = REASON_INITIALIZER_THREW_MESSAGE;
    }
  } else {
    cause = reason;
  }

  return noSSRError(BROWSER_BAILOUT_MESSAGE, undefined, { cause });
}

// In the browser every `browser()` call hands out the same, already fulfilled
// usable: `use()` reads the status synchronously and returns `undefined` without
// suspending, and React never has to track a fresh thenable on re-render.
const fulfilledBrowserUsable: FulfilledReactPromise<undefined> = {
  status: 'fulfilled',
  value: undefined,
  // eslint-disable-next-line sukka/unicorn/no-thenable -- a thenable is the contract React's use() consumes
  then(onfulfilled, onrejected) {
    // eslint-disable-next-line promise/prefer-catch -- delegates PromiseLike#then(onfulfilled, onrejected) as is
    return Promise.resolve(undefined).then(onfulfilled, onrejected);
  }
};

function browserPolyfill(reason?: BrowserReason): BrowserUsable {
  /* istanbul ignore if -- unreachable when Happy DOM registers window globally; covered
     for real by the server-realm worker test (nyc cannot see into worker threads) */
  if (typeof window === 'undefined') {
    const error = browserBailoutError(reason);

    // `use()` throws the reason of an already rejected usable synchronously. The
    // server renderer then treats it like any other error thrown inside a
    // <Suspense> boundary: the fallback is sent as HTML and the boundary is
    // marked for client rendering, which is exactly what `noSSR()` relies on.
    return {
      status: 'rejected',
      reason: error,
      // eslint-disable-next-line sukka/unicorn/no-thenable -- a thenable is the contract React's use() consumes
      then(onfulfilled, onrejected) {
        // eslint-disable-next-line promise/prefer-catch -- delegates PromiseLike#then(onfulfilled, onrejected) as is
        return Promise.reject(error).then(onfulfilled, onrejected);
      }
    };
  }

  return fulfilledBrowserUsable;
}

/** @see https://foxact.skk.moe/browser */
export const browser: (reason?: BrowserReason) => BrowserUsable = 'browser' in reactDomExports && /* istanbul ignore next */ typeof reactDomExports.browser === 'function'
  ? /* istanbul ignore next */ reactDomExports.browser as (reason?: BrowserReason) => BrowserUsable
  : browserPolyfill;
