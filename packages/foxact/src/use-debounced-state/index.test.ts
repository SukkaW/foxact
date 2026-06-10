import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import * as FakeTimers from '@sinonjs/fake-timers';
import { useDebouncedState } from '.';

const WAIT = 300;

describe('useDebouncedState', () => {
  let clock: FakeTimers.Clock;

  // only fake setTimeout/clearTimeout: React's scheduler and Happy DOM
  // internals should keep running on real timers
  beforeEach(() => {
    clock = FakeTimers.install({ toFake: ['setTimeout', 'clearTimeout'] });
  });
  afterEach(() => clock.uninstall());

  it('returns the initial value, with lazy initializer support', () => {
    const { result } = renderHook(() => useDebouncedState('initial', WAIT));
    expect(result.current[0]).toEqual('initial');

    const { result: lazyResult } = renderHook(() => useDebouncedState(() => 'lazy', WAIT));
    expect(lazyResult.current[0]).toEqual('lazy');
  });

  it('debounces state updates by the given wait', () => {
    const { result } = renderHook(() => useDebouncedState('a', WAIT));

    act(() => result.current[1]('b'));
    expect(result.current[0]).toEqual('a');

    act(() => clock.tick(WAIT - 1));
    expect(result.current[0]).toEqual('a');

    act(() => clock.tick(1));
    expect(result.current[0]).toEqual('b');
  });

  it('only applies the last value of rapid successive updates', () => {
    const { result } = renderHook(() => useDebouncedState('a', WAIT));

    act(() => result.current[1]('b'));
    act(() => clock.tick(WAIT - 1));
    act(() => result.current[1]('c'));

    // the previous pending update is retimed, 'b' is never applied
    act(() => clock.tick(WAIT - 1));
    expect(result.current[0]).toEqual('a');

    act(() => clock.tick(1));
    expect(result.current[0]).toEqual('c');
  });

  it('applies the first update immediately when leading is enabled', () => {
    const { result } = renderHook(() => useDebouncedState('a', WAIT, true));

    act(() => result.current[1]('b'));
    expect(result.current[0]).toEqual('b');

    // the leading slot is consumed: subsequent updates are debounced
    act(() => result.current[1]('c'));
    expect(result.current[0]).toEqual('b');

    act(() => clock.tick(WAIT));
    expect(result.current[0]).toEqual('c');

    // after the trailing update fires, the leading slot is restored
    act(() => result.current[1]('d'));
    expect(result.current[0]).toEqual('d');
  });

  it('forceSetValue applies immediately and cancels the pending debounced update', () => {
    const { result } = renderHook(() => useDebouncedState('a', WAIT));

    act(() => result.current[1]('b'));
    act(() => result.current[2]('c'));
    expect(result.current[0]).toEqual('c');

    // the pending debounced 'b' was cancelled
    act(() => clock.tick(WAIT));
    expect(result.current[0]).toEqual('c');
    expect(clock.countTimers()).toEqual(0);
  });

  it('returns stable setters across re-renders', () => {
    const { result, rerender } = renderHook(() => useDebouncedState('a', WAIT));
    const [, debouncedSet, forceSet] = result.current;

    rerender();

    expect(result.current[1]).toExactlyEqual(debouncedSet);
    expect(result.current[2]).toExactlyEqual(forceSet);
  });
});
