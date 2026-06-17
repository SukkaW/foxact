import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, renderHook } from '@testing-library/react';
import { useIsClient } from '.';
import { trapConsoleError } from '../../test/trap-console-error';

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

    const trap = trapConsoleError();

    let root: ReturnType<typeof hydrateRoot>;
    try {
      act(() => {
        root = hydrateRoot(container, <Probe />);
      });
    } finally {
      trap.restore();
    }

    // the first pass hydrates with the server markup, the second pass flips
    expect(container.textContent).toEqual('client');
    expect(trap.calls).toEqual([]);

    act(() => root.unmount());
    container.remove();
  });
});
