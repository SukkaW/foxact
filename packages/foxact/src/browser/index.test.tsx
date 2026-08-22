import { describe, it, before } from 'mocha';
import { expect } from 'earl';

import path from 'node:path';
import { Suspense, use } from 'react';
import * as reactDomExports from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import { act, render, screen } from '@testing-library/react';
import { runOnServer } from '../../test/server-realm';
import { trapConsoleError } from '../../test/trap-console-error';
import { browser, browserBailoutError } from '.';
import type { BrowserReason } from '.';
import type { ServerRealmFixtureResult } from './__fixtures__/server-realm';

const nativeBrowser = 'browser' in reactDomExports ? reactDomExports.browser : undefined;
const isNativeBrowser = typeof nativeBrowser === 'function';

function Editor({ reason }: { reason?: BrowserReason }) {
  use(browser(reason));
  return <span>editor</span>;
}

function App({ reason }: { reason?: BrowserReason }) {
  return (
    <Suspense fallback={<span>loading</span>}>
      <Editor reason={reason} />
    </Suspense>
  );
}

function TypeofEditor() {
  const value = use(browser('The editor requires browser APIs.'));
  return <span>editor:{typeof value}</span>;
}

describe('browserBailoutError', () => {
  it('creates the error React reports for a browser-only render, marked like noSSRError', () => {
    const error = browserBailoutError('The editor requires browser APIs.') as Error & { digest: string, recoverableError: string };

    expect(error.message).toEqual('Browser-only rendering was requested by `browser()`.');
    expect(error.cause).toEqual('The editor requires browser APIs.');
    // the same markers as noSSR(), so Next.js and the existing filtering recipes apply
    expect(error.digest).toEqual('BAILOUT_TO_CLIENT_SIDE_RENDERING');
    expect(error.recoverableError).toEqual('NO_SSR');
  });

  it('omits the cause when no reason is given', () => {
    expect('cause' in browserBailoutError()).toEqual(false);
  });

  it('initializes a reason function and uses its result as the cause', () => {
    let initializerCalls = 0;
    const cause = new Error('lazy reason');

    const error = browserBailoutError(() => {
      initializerCalls++;
      return cause;
    });

    expect(initializerCalls).toEqual(1);
    expect(error.cause as Error).toExactlyEqual(cause);
  });

  it('reports a throwing reason initializer instead of failing', () => {
    const error = browserBailoutError(() => {
      throw new Error('initializer exploded');
    });

    expect(error.cause).toEqual('The reason for browser-only rendering could not be determined because its initializer threw.');
  });

  it('is stackless', () => {
    expect(browserBailoutError('stackless').stack ?? '').not.toInclude('\n    at ');
  });
});

describe('browser', () => {
  it('is ReactDOM.browser itself when available (React DOM 19.3+)', function () {
    if (!isNativeBrowser) this.skip();

    expect(browser).toExactlyEqual(nativeBrowser);
  });

  it('renders the browser-only content synchronously in the browser, use() returns undefined', () => {
    render(
      <Suspense fallback={<span>loading</span>}>
        <TypeofEditor />
      </Suspense>
    );

    expect(screen.getByText('editor:undefined')).not.toBeNullish();
    expect(screen.queryByText('loading')).toBeNullish();
  });

  it('works without a reason', () => {
    render(<App />);

    expect(screen.getByText('editor')).not.toBeNullish();
  });

  it('never invokes a reason initializer in the browser', () => {
    let initializerCalls = 0;

    render(
      <App
        reason={() => {
          initializerCalls++;
          return new Error('expensive to create');
        }}
      />
    );

    expect(screen.getByText('editor')).not.toBeNullish();
    expect(initializerCalls).toEqual(0);
  });

  it('survives re-renders with a different reason', () => {
    const { rerender } = render(<App reason="first" />);
    rerender(<App reason="second" />);

    expect(screen.getByText('editor')).not.toBeNullish();
  });

  describe('polyfill (React DOM without browser())', () => {
    before(function () {
      if (isNativeBrowser) this.skip();
    });

    it('hands out one shared, already fulfilled usable in the browser', () => {
      const usable = browser('The editor requires browser APIs.');

      expect(usable.status).toEqual('fulfilled');
      expect((usable as { value?: unknown }).value).toEqual(undefined);
      // the same object every time, so React never tracks a fresh thenable per render
      expect(browser()).toExactlyEqual(usable);
    });

    it('honors the thenable contract', async () => {
      expect(await browser()).toEqual(undefined);
    });

    describe('during server rendering (worker thread)', () => {
      let result: ServerRealmFixtureResult;

      // Runs in a TRUE server realm (worker thread) where `typeof window` is
      // natively 'undefined'
      before(async function () {
        this.timeout(10000); // worker spawn + swc compilation

        result = await runOnServer<ServerRealmFixtureResult>(path.join(__dirname, '__fixtures__/server-realm.tsx'));

        expect(result.typeofWindow).toEqual('undefined');
      });

      it('hands out an already rejected usable carrying the bailout error', () => {
        expect(result.status).toEqual('rejected');
        expect(result.error.message).toEqual('Browser-only rendering was requested by `browser()`.');
        expect(result.error.cause).toEqual('The editor requires browser APIs.');
        // the same markers as noSSR(), so Next.js and the existing filtering recipes apply
        expect(result.error.digest).toEqual('BAILOUT_TO_CLIENT_SIDE_RENDERING');
        expect(result.error.recoverableError).toEqual('NO_SSR');
        expect(result.error.stackless).toEqual(true);
      });

      it('omits the cause when no reason is given', () => {
        expect(result.withoutReason.hasCause).toEqual(false);
        expect(result.withoutReason.message).toEqual('Browser-only rendering was requested by `browser()`.');
      });

      it('initializes a reason function on the server, and uses its result as the cause', () => {
        expect(result.lazyReason.initializerCalls).toEqual(1);
        expect(result.lazyReason.cause).toEqual('lazy reason');
      });

      it('reports a throwing reason initializer instead of failing', () => {
        expect(result.throwingReason.cause).toEqual('The reason for browser-only rendering could not be determined because its initializer threw.');
      });

      it('makes stream SSR render the closest Suspense fallback and report the bailout to onError', () => {
        expect(result.inSuspense.shellError).toBeNullish();
        expect(result.inSuspense.html).toInclude('loading');
        expect(result.inSuspense.html).not.toInclude('editor');

        expect(result.inSuspense.errors.length).toEqual(1);
        expect(result.inSuspense.errors[0].message).toEqual('Browser-only rendering was requested by `browser()`.');
        expect(result.inSuspense.errors[0].recoverableError).toEqual('NO_SSR');
      });

      it('fails the server render when used outside of a Suspense boundary', () => {
        expect(result.outsideSuspense.shellError).not.toBeNullish();
        expect(result.outsideSuspense.html).toEqual('');
      });

      it('hydrates the server HTML into the browser-only content, surfacing a filterable recoverable error', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = result.inSuspense.html;

        expect(container.textContent).toEqual('loading');

        const recoverableErrors: unknown[] = [];
        const trap = trapConsoleError();

        let root: ReturnType<typeof hydrateRoot>;
        try {
          act(() => {
            root = hydrateRoot(container, <App reason="The editor requires browser APIs." />, {
              onRecoverableError(error) {
                recoverableErrors.push(error);
              }
            });
          });
        } finally {
          trap.restore();
        }

        expect(container.textContent).toEqual('editor');
        expect(trap.calls).toEqual([]);

        // React DOM < 19.3 reports the client-rendered boundary through onRecoverableError,
        // carrying the digest the server's onError forwarded: that's what to filter on
        expect(recoverableErrors.length).toEqual(1);
        expect((recoverableErrors[0] as { digest?: string }).digest).toEqual('BAILOUT_TO_CLIENT_SIDE_RENDERING');

        act(() => root.unmount());
        container.remove();
      });
    });
  });
});
