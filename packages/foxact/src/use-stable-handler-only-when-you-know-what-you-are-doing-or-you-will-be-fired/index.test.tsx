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

  it('always invokes the latest callback through the very same reference', () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0);
      const handler = useStableHandler(() => count);
      return { handler, setCount };
    });

    const handlerBefore = result.current.handler;
    expect(handlerBefore()).toEqual(0);

    act(() => result.current.setCount(42));

    // the reference did NOT change across the state update...
    expect(result.current.handler).toExactlyEqual(handlerBefore);
    // ... yet it sees the latest state
    expect(handlerBefore()).toEqual(42);
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
