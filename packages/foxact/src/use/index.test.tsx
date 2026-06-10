import { describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense, use as reactUse } from 'react';
import { act, render, screen } from '@testing-library/react';
import { use } from '.';

// the thenable contract React.use consumes (and the polyfill implements):
// a real promise carrying a pre-tracked status

describe('use', () => {
  it('is React.use itself when available (React 19)', () => {
    expect(use).toExactlyEqual(reactUse);
  });

  it('suspends to the closest Suspense fallback on a pending promise', async () => {
    // a forever-pending promise keeps the boundary suspended
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- forever pending
    const pending = new Promise<string>(() => {});

    function Probe() {
      return <span>{use(pending)}</span>;
    }

    // a component suspending inside act requires the act scope to be awaited,
    // RTL render()'s own synchronous act is not enough here
    // eslint-disable-next-line @typescript-eslint/require-await, testing-library/no-unnecessary-act -- async act scope is required for suspending components
    await act(async () => {
      render(
        <Suspense fallback={<span>loading</span>}>
          <Probe />
        </Suspense>
      );
    });

    expect(screen.getByText('loading')).not.toBeNullish();
  });

  it('returns the value of an already fulfilled thenable synchronously', () => {
    const fulfilled = Object.assign(
      Promise.resolve('resolved value'),
      { status: 'fulfilled' as const, value: 'resolved value' }
    );

    function Probe() {
      return <span>{use(fulfilled)}</span>;
    }

    render(<Probe />);

    expect(screen.getByText('resolved value')).not.toBeNullish();
  });

  it('throws the reason of a rejected thenable', () => {
    const rejected = Object.assign(
      // the underlying promise never settles, React only reads the status
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- forever pending
      new Promise<string>(() => {}),
      { status: 'rejected' as const, reason: new Error('use() rejection reason') }
    );

    function Probe() {
      return <span>{use(rejected)}</span>;
    }

    // React reports the render error through console.error, silence it
    /* eslint-disable no-console -- intercept React error reporting */
    const originalConsoleError = console.error;
    console.error = () => { /* noop */ };
    try {
      expect(() => render(<Probe />)).toThrow('use() rejection reason');
    } finally {
      console.error = originalConsoleError;
    }
    /* eslint-enable no-console */
  });
});
