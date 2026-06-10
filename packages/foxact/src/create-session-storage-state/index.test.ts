import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { createSessionStorageState } from '.';

describe('createSessionStorageState', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('creates hooks backed by sessionStorage', () => {
    const [useOpenState, useOpen, useSetOpen] = createSessionStorageState('css-open', false);

    const { result: stateResult } = renderHook(() => useOpenState());
    const { result: valueResult } = renderHook(() => useOpen());
    const { result: setterResult } = renderHook(() => useSetOpen());

    act(() => setterResult.current(true));

    expect(stateResult.current[0]).toEqual(true);
    expect(valueResult.current).toEqual(true);
    expect(window.sessionStorage.getItem('css-open')).toEqual(JSON.stringify(true));
    expect(window.localStorage.getItem('css-open')).toEqual(null);
  });
});
