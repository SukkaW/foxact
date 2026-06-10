import { describe, it } from 'mocha';
import { expect } from 'earl';

import path from 'node:path';
import { runOnServer } from '../../test/server-realm';
import { noSSR, noSSRError } from '.';

interface NoSSRError extends Error {
  digest: string,
  recoverableError: string
}

describe('noSSRError', () => {
  it('creates an error with the given message', () => {
    expect(noSSRError('do not render me on the server').message).toEqual('do not render me on the server');
  });

  it('is marked as recoverable, with the Next.js bailout digest by default', () => {
    const error = noSSRError() as NoSSRError;

    expect(error.digest).toEqual('BAILOUT_TO_CLIENT_SIDE_RENDERING');
    expect(error.recoverableError).toEqual('NO_SSR');
  });

  it('accepts a custom digest', () => {
    const error = noSSRError('message', 'CUSTOM_DIGEST') as NoSSRError;

    expect(error.digest).toEqual('CUSTOM_DIGEST');
  });

  it('is stackless', () => {
    const error = noSSRError('stackless');

    expect(error.stack ?? '').not.toInclude('\n    at ');
  });
});

describe('noSSR', () => {
  it('is a no-op on the client', () => {
    expect(() => noSSR()).not.toThrow();
  });

  // Runs in a TRUE server realm (worker thread) where `typeof window` is
  // natively 'undefined': throws the recoverable error, and stream SSR
  // renders the closest Suspense fallback into the HTML
  it('throws on the server, making stream SSR render the Suspense fallback (worker thread)', async function () {
    this.timeout(10000); // worker spawn + swc compilation

    interface FixtureResult {
      typeofWindow: string,
      thrown: {
        isError: boolean,
        message: string,
        digest: string,
        recoverableError: string
      },
      html: string
    }

    const result = await runOnServer<FixtureResult>(path.join(__dirname, '__fixtures__/server-realm.tsx'));

    expect(result.typeofWindow).toEqual('undefined');

    expect(result.thrown.isError).toEqual(true);
    expect(result.thrown.message).toEqual('extra message');
    expect(result.thrown.digest).toEqual('BAILOUT_TO_CLIENT_SIDE_RENDERING');
    expect(result.thrown.recoverableError).toEqual('NO_SSR');

    expect(result.html).toInclude('loading');
    expect(result.html).not.toInclude('chat');
  });
});
