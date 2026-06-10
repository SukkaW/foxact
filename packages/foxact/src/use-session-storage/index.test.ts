import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, renderHook } from '@testing-library/react';
import { useSessionStorage, useSetSessionStorage } from '.';

// useSessionStorage is created by the same createStorage factory as
// useLocalStorage (extensively covered in use-local-storage tests), these
// only pin that it operates on sessionStorage
describe('useSessionStorage', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('reads and writes sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('session-key', 'default'));

    expect(result.current[0]).toEqual('default');

    act(() => result.current[1]('changed'));

    expect(result.current[0]).toEqual('changed');
    expect(window.sessionStorage.getItem('session-key')).toEqual(JSON.stringify('changed'));
    expect(window.localStorage.getItem('session-key')).toEqual(null);
  });

  it('synchronizes every hook instance with the same key', () => {
    const { result } = renderHook(() => useSessionStorage('session-shared', 'initial'));
    const { result: result2 } = renderHook(() => useSessionStorage('session-shared', 'initial'));

    act(() => result.current[1]('changed'));

    expect(result2.current[0]).toEqual('changed');
  });
});

describe('useSetSessionStorage', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('writes to the storage without subscribing to the value', () => {
    const { result } = renderHook(() => useSetSessionStorage<string>('session-set-only'));

    act(() => result.current('written'));

    expect(window.sessionStorage.getItem('session-set-only')).toEqual(JSON.stringify('written'));
  });
});
