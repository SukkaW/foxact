import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderHook } from '@testing-library/react';
import { useSingleton } from '.';

describe('useSingleton', () => {
  it('initializes on the first render and keeps the value', () => {
    const { result, rerender } = renderHook(() => useSingleton(() => ({ foo: 'bar' })));
    const instance = result.current.current;

    expect(instance).toEqual({ foo: 'bar' });

    rerender();

    expect(result.current.current).toExactlyEqual(instance);
  });

  it('only calls the initializer once across re-renders', () => {
    let initCount = 0;

    const { rerender } = renderHook(() => useSingleton(() => {
      initCount++;
      return Symbol('singleton');
    }));

    rerender();
    rerender();

    expect(initCount).toEqual(1);
  });

  it('returns a stable ref object across re-renders', () => {
    const { result, rerender } = renderHook(() => useSingleton(() => 42));
    const ref = result.current;

    rerender();

    expect(result.current).toExactlyEqual(ref);
  });

  it('re-invokes the initializer until it returns non-nullish, allowing delayed expensive init', () => {
    // Returning null/undefined from the initializer is intentional: it means
    // "not ready yet", so an expensive `new Expensive()` can be delayed until
    // some condition is met on a later render.
    class Expensive {
      readonly name = 'expensive';
    }

    let ready = false;
    let initCount = 0;

    const { result, rerender } = renderHook(() => useSingleton<Expensive | null>(() => {
      initCount++;
      return ready ? new Expensive() : null;
    }));

    // Not ready: stays uninitialized, the initializer is retried every render
    expect(result.current.current).toEqual(null);
    rerender();
    expect(result.current.current).toEqual(null);
    expect(initCount).toEqual(2);

    // Becomes ready: the next render creates the instance...
    ready = true;
    rerender();
    const instance = result.current.current;
    expect(instance).toBeA(Expensive);
    expect(initCount).toEqual(3);

    // ... and from then on it is a proper singleton
    rerender();
    // expect().toExactlyEqual() expect object and no null, so we assert that
    expect(result.current.current!).toExactlyEqual(instance);
    expect(initCount).toEqual(3);
  });

  it('does not retry when conditionally initialized with a non-nullish sentinel', () => {
    // Documented escape hatch: to conditionally create a singleton WITHOUT
    // the nullish retry behavior, return a non-nullish sentinel instead.
    const kNoInitialize = Symbol('no initialize');

    let initCount = 0;

    const { result, rerender } = renderHook(() => useSingleton<typeof kNoInitialize | { foo: string }>(() => {
      initCount++;
      return kNoInitialize;
    }));

    expect(result.current.current).toEqual(kNoInitialize);

    rerender();

    expect(result.current.current).toEqual(kNoInitialize);
    expect(initCount).toEqual(1);
  });
});
