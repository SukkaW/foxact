import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useIsOnline } from '.';

function goOffline() {
  Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
}

function goOnline() {
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
}

describe('useIsOnline', () => {
  afterEach(() => {
    // remove the instance property, restoring the prototype getter
    Reflect.deleteProperty(navigator, 'onLine');
  });

  it('returns true when online', () => {
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toEqual(true);
  });

  it('flips when the connection goes away and comes back', () => {
    const { result } = renderHook(() => useIsOnline());

    goOffline();
    expect(result.current).toEqual(false);

    goOnline();
    expect(result.current).toEqual(true);
  });

  it('updates every consumer', () => {
    const { result } = renderHook(() => useIsOnline());
    const { result: result2 } = renderHook(() => useIsOnline());

    goOffline();

    expect(result.current).toEqual(false);
    expect(result2.current).toEqual(false);
  });
});
