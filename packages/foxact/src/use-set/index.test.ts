import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useSet } from '.';

describe('useSet', () => {
  it('starts with an empty set by default', () => {
    const { result } = renderHook(() => useSet<string>());

    expect(result.current[0].size).toEqual(0);
  });

  it('accepts an initial state', () => {
    const { result } = renderHook(() => useSet(new Set(['foo'])));

    expect(result.current[0].has('foo')).toEqual(true);
  });

  it('accepts a lazy initializer', () => {
    const { result } = renderHook(() => useSet(() => new Set([1, 2])));

    expect([...result.current[0]]).toEqual([1, 2]);
  });

  it('adds values immutably', () => {
    const { result } = renderHook(() => useSet<number>());
    const setBefore = result.current[0];

    act(() => result.current[1](42));

    expect(result.current[0].has(42)).toEqual(true);
    expect(result.current[0]).not.toExactlyEqual(setBefore);
    expect(setBefore.size).toEqual(0);
  });

  it('returns the same set instance when adding an existing value', () => {
    const { result } = renderHook(() => useSet(new Set([1])));
    const setBefore = result.current[0];

    act(() => result.current[1](1));

    expect(result.current[0]).toExactlyEqual(setBefore);
  });

  it('removes values immutably', () => {
    const { result } = renderHook(() => useSet(new Set(['a', 'b'])));
    const setBefore = result.current[0];

    act(() => result.current[2]('a'));

    expect(result.current[0].has('a')).toEqual(false);
    expect(result.current[0].has('b')).toEqual(true);
    expect(result.current[0]).not.toExactlyEqual(setBefore);
    // The previous set must not be mutated
    expect(setBefore.has('a')).toEqual(true);
  });

  it('returns the same set instance when removing a value that is not there', () => {
    const { result } = renderHook(() => useSet(new Set([1])));
    const setBefore = result.current[0];

    act(() => result.current[2](2));

    expect(result.current[0]).toExactlyEqual(setBefore);
    expect(result.current[0].has(1)).toEqual(true);
  });

  it('resets to an empty set', () => {
    const { result } = renderHook(() => useSet(new Set([1, 2, 3])));

    act(() => result.current[3]());

    expect(result.current[0].size).toEqual(0);
  });

  it('replaces the entire set via setAll', () => {
    const { result } = renderHook(() => useSet(new Set([1])));
    const next = new Set([4, 5]);

    act(() => result.current[4](next));

    expect(result.current[0]).toExactlyEqual(next);
  });

  it('returns stable callbacks across re-renders', () => {
    const { result, rerender } = renderHook(() => useSet<number>());
    const [, add, remove, reset, setAll] = result.current;

    rerender();

    expect(result.current[1]).toExactlyEqual(add);
    expect(result.current[2]).toExactlyEqual(remove);
    expect(result.current[3]).toExactlyEqual(reset);
    expect(result.current[4]).toExactlyEqual(setAll);
  });
});
