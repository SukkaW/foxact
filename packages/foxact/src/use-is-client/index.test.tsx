import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, renderHook } from '@testing-library/react';
import { useIsClient } from '.';

function Probe() {
  return <span>{useIsClient() ? 'client' : 'server'}</span>;
}

describe('useIsClient', () => {
  it('returns true on the client', () => {
    const { result } = renderHook(() => useIsClient());

    expect(result.current).toEqual(true);
  });

  it('returns false on the server', () => {
    expect(renderToString(<Probe />)).toInclude('server');
  });

  it('performs a two-pass rendering after hydration, without a hydration mismatch', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<Probe />);

    expect(container.textContent).toEqual('server');

    // hydration mismatches are reported through console.error
    /* eslint-disable no-console -- intercept console.error to catch hydration mismatches */
    const consoleErrorCalls: unknown[] = [];
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => consoleErrorCalls.push(args);

    let root: ReturnType<typeof hydrateRoot>;
    try {
      act(() => {
        root = hydrateRoot(container, <Probe />);
      });
    } finally {
      console.error = originalConsoleError;
    }
    /* eslint-enable no-console */

    // the first pass hydrates with the server markup, the second pass flips
    expect(container.textContent).toEqual('client');
    expect(consoleErrorCalls).toEqual([]);

    act(() => root.unmount());
    container.remove();
  });
});
