import { describe, it } from 'mocha';
import { expect } from 'earl';

import { useState } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { useStableHandler } from '.';

describe('useStableHandler', () => {
  it('returns a stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useStableHandler(() => 'whatever'));
    const handler = result.current;

    rerender();

    expect(result.current).toExactlyEqual(handler);
  });

  it('always invokes the latest callback', () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0);
      const handler = useStableHandler(() => count);
      return { handler, setCount };
    });

    expect(result.current.handler()).toEqual(0);

    act(() => result.current.setCount(42));

    // same stable reference, but it sees the latest state
    expect(result.current.handler()).toEqual(42);
  });

  it('throws when invoked during render, before the component has mounted', () => {
    function Probe() {
      const handler = useStableHandler(() => 'value');
      // render methods should be pure: calling the handler during the initial
      // render must throw
      handler();
      return null;
    }

    expect(() => render(<Probe />)).toThrow(
      'foxact: the stablized handler cannot be invoked before the component has mounted.'
    );
  });
});
