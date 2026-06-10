import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import * as FakeTimers from '@sinonjs/fake-timers';
import { useDebouncedValue } from '.';

const WAIT = 300;

describe('useDebouncedValue', () => {
  let clock: FakeTimers.Clock;

  // only fake setTimeout/clearTimeout: React's scheduler and Happy DOM
  // internals should keep running on real timers
  beforeEach(() => {
    clock = FakeTimers.install({ toFake: ['setTimeout', 'clearTimeout'] });
  });
  afterEach(() => clock.uninstall());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', WAIT));

    expect(result.current).toEqual('initial');
  });

  it('debounces changes of the input value', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebouncedValue(value, WAIT),
      { initialProps: 'a' }
    );

    rerender('b');
    expect(result.current).toEqual('a');

    act(() => clock.tick(WAIT - 1));
    expect(result.current).toEqual('a');

    act(() => clock.tick(1));
    expect(result.current).toEqual('b');
  });

  it('only reflects the last of rapid successive changes', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebouncedValue(value, WAIT),
      { initialProps: 'a' }
    );

    rerender('b');
    act(() => clock.tick(WAIT - 1));
    rerender('c');

    // the pending timeout for 'b' is cleared by the effect cleanup
    act(() => clock.tick(WAIT - 1));
    expect(result.current).toEqual('a');

    act(() => clock.tick(1));
    expect(result.current).toEqual('c');
  });

  it('with leading, the mount consumes the leading slot, restored after a trailing update', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebouncedValue(value, WAIT, true),
      { initialProps: 'a' }
    );

    // mount itself runs the effect with the leading slot
    expect(result.current).toEqual('a');

    // ... so the first change after mount is debounced
    rerender('b');
    expect(result.current).toEqual('a');
    act(() => clock.tick(WAIT));
    expect(result.current).toEqual('b');

    // the trailing update restored the leading slot: next change is immediate
    rerender('c');
    expect(result.current).toEqual('c');
  });

  it('does not update after unmount', () => {
    const { result, rerender, unmount } = renderHook(
      (value: string) => useDebouncedValue(value, WAIT),
      { initialProps: 'a' }
    );

    rerender('b');
    unmount();

    // the pending timeout is cleared on unmount
    expect(clock.countTimers()).toEqual(0);
    expect(result.current).toEqual('a');
  });

  it('throws when the value is a function', () => {
    expect(() => {
      // @ts-expect-error -- deliberately violating NotFunction<T> at runtime
      renderHook(() => useDebouncedValue(() => 'nope', WAIT));
    }).toThrow('[foxact/use-debounced-value] useDebouncedValue does not support function as value');
  });
});
