import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useMap } from '.';

describe('useMap', () => {
  it('starts with an empty map by default', () => {
    const { result } = renderHook(() => useMap<string, number>());

    expect(result.current[0].size).toEqual(0);
  });

  it('accepts an initial state', () => {
    const { result } = renderHook(() => useMap(new Map([['foo', 1]])));

    expect(result.current[0].get('foo')).toEqual(1);
  });

  it('adds and removes entries immutably', () => {
    const { result } = renderHook(() => useMap<string, number>());
    const firstMap = result.current[0];

    act(() => result.current[1]('foo', 42));

    expect(result.current[0].get('foo')).toEqual(42);
    expect(result.current[0]).not.toExactlyEqual(firstMap);

    act(() => result.current[2]('foo'));

    expect(result.current[0].has('foo')).toEqual(false);
  });

  it('returns the same map instance when removing a key that is not there', () => {
    const { result } = renderHook(() => useMap(new Map([['foo', 1]])));
    const mapBefore = result.current[0];

    act(() => result.current[2]('bar'));

    expect(result.current[0]).toExactlyEqual(mapBefore);
    expect(result.current[0].get('foo')).toEqual(1);
  });

  it('resets to an empty map', () => {
    const { result } = renderHook(() => useMap(new Map([['foo', 1], ['bar', 2]])));

    act(() => result.current[3]());

    expect(result.current[0].size).toEqual(0);
  });

  it('returns stable callbacks across re-renders', () => {
    const { result, rerender } = renderHook(() => useMap<string, number>());
    const [, add, remove, reset, setAll] = result.current;

    rerender();

    expect(result.current[1]).toExactlyEqual(add);
    expect(result.current[2]).toExactlyEqual(remove);
    expect(result.current[3]).toExactlyEqual(reset);
    expect(result.current[4]).toExactlyEqual(setAll);
  });
});
