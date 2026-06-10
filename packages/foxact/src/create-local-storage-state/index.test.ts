import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { createLocalStorageState } from '.';

describe('createLocalStorageState', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('creates a state hook, a value hook and a setter hook sharing the same key', () => {
    const [useOpenState, useOpen, useSetOpen] = createLocalStorageState('cls-open', false);

    const { result: stateResult } = renderHook(() => useOpenState());
    const { result: valueResult } = renderHook(() => useOpen());
    const { result: setterResult } = renderHook(() => useSetOpen());

    expect(stateResult.current[0]).toEqual(false);
    expect(valueResult.current).toEqual(false);

    // setter hook updates every consumer, across hook instances
    act(() => setterResult.current(true));

    expect(stateResult.current[0]).toEqual(true);
    expect(valueResult.current).toEqual(true);
    expect(window.localStorage.getItem('cls-open')).toEqual(JSON.stringify(true));
  });

  it('also updates through the state hook tuple setter', () => {
    const [useOpenState, useOpen] = createLocalStorageState('cls-tuple', 0);

    const { result: stateResult } = renderHook(() => useOpenState());
    const { result: valueResult } = renderHook(() => useOpen());

    act(() => stateResult.current[1](42));

    expect(valueResult.current).toEqual(42);
  });
});
