import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useStateWithDeps } from '.';

describe('useStateWithDeps', () => {
  it('returns the initial state', () => {
    const { result } = renderHook(() => useStateWithDeps({ a: 1, b: 'foo' }));

    expect(result.current[0].a).toEqual(1);
    expect(result.current[0].b).toEqual('foo');
  });

  it('updates state via partial payload', () => {
    const { result } = renderHook(() => useStateWithDeps({ a: 1, b: 'foo' }));

    act(() => result.current[1]({ a: 2 }));

    expect(result.current[0].a).toEqual(2);
    expect(result.current[0].b).toEqual('foo');
  });

  it('re-renders only when an accessed (tracked) property changes', () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      const [state, setState] = useStateWithDeps({ tracked: 0, untracked: 0 });
      // Only read `tracked` during render, so only it becomes a dependency
      return [state.tracked, setState, state] as const;
    });

    expect(renderCount).toEqual(1);

    // Updating a property that's never read during render must not re-render
    act(() => result.current[1]({ untracked: 1 }));
    expect(renderCount).toEqual(1);

    // ... but the value is still updated in place
    expect(result.current[2].untracked).toEqual(1);

    // Updating a property read during render triggers a re-render
    act(() => result.current[1]({ tracked: 1 }));
    expect(renderCount).toEqual(2);
    expect(result.current[0]).toEqual(1);
  });

  it('does not re-render when setting the same value', () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      const [state, setState] = useStateWithDeps({ a: 1 });
      return [state.a, setState] as const;
    });

    act(() => result.current[1]({ a: 1 }));

    expect(renderCount).toEqual(1);
  });

  it('supports adding a field that is not part of the initial state', () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useStateWithDeps<{ a: number, b?: number }>({ a: 1 });
    });

    // A brand-new key has never been read during render, so no re-render yet
    act(() => result.current[1]({ b: 42 }));
    expect(renderCount).toEqual(1);

    // ... but a tracked getter has been attached for it on the fly
    expect('b' in result.current[0]).toEqual(true);
    expect(result.current[0].b).toEqual(42);

    // Reading it above marked it as a dependency, so updates now re-render
    act(() => result.current[1]({ b: 43 }));
    expect(renderCount).toEqual(2);
    expect(result.current[0].b).toEqual(43);
  });

  it('returns a stable setState across re-renders', () => {
    const { result, rerender } = renderHook(() => useStateWithDeps({ a: 1 }));
    const setState = result.current[1];

    rerender();

    expect(result.current[1]).toExactlyEqual(setState);
  });
});
