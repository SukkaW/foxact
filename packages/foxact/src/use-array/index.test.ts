import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useArray } from '.';

describe('useArray', () => {
  it('starts with an empty array by default', () => {
    const { result } = renderHook(() => useArray<number>());

    expect(result.current[0]).toEqual([]);
  });

  it('accepts an initial state', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]));

    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it('accepts a lazy initializer', () => {
    const { result } = renderHook(() => useArray(() => ['foo']));

    expect(result.current[0]).toEqual(['foo']);
  });

  it('adds values immutably', () => {
    const { result } = renderHook(() => useArray([1]));
    const arrayBefore = result.current[0];

    act(() => result.current[1](2));

    expect(result.current[0]).toEqual([1, 2]);
    expect(result.current[0]).not.toExactlyEqual(arrayBefore);
    expect(arrayBefore).toEqual([1]);
  });

  it('resets to an empty array', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]));

    act(() => result.current[2]());

    expect(result.current[0]).toEqual([]);
  });

  it('removes a value by index immutably', () => {
    const { result } = renderHook(() => useArray(['a', 'b', 'c']));
    const arrayBefore = result.current[0];

    act(() => result.current[3](1));

    expect(result.current[0]).toEqual(['a', 'c']);
    expect(result.current[0]).not.toExactlyEqual(arrayBefore);
    expect(arrayBefore).toEqual(['a', 'b', 'c']);
  });

  it('returns the same array instance when removing an out-of-range index', () => {
    const { result } = renderHook(() => useArray([1, 2]));
    const arrayBefore = result.current[0];

    // negative index
    act(() => result.current[3](-1));
    expect(result.current[0]).toExactlyEqual(arrayBefore);

    // index >= length
    act(() => result.current[3](2));
    expect(result.current[0]).toExactlyEqual(arrayBefore);

    expect(result.current[0]).toEqual([1, 2]);
  });

  it('returns stable callbacks across re-renders', () => {
    const { result, rerender } = renderHook(() => useArray<number>());
    const [, add, reset, removeByIndex] = result.current;

    rerender();

    expect(result.current[1]).toExactlyEqual(add);
    expect(result.current[2]).toExactlyEqual(reset);
    expect(result.current[3]).toExactlyEqual(removeByIndex);
  });
});
