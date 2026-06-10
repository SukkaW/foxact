import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { useLocalStorage, useSetLocalStorage } from '.';

describe('useLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns the default value when the storage is empty, and persists it', () => {
    const { result } = renderHook(() => useLocalStorage('key-default', 'circle'));

    expect(result.current[0]).toEqual('circle');
    // the layout effect persists the default value into the storage
    expect(window.localStorage.getItem('key-default')).toEqual(JSON.stringify('circle'));
  });

  it('returns null when the storage is empty and no default value is provided', () => {
    const { result } = renderHook(() => useLocalStorage<string>('key-null'));

    expect(result.current[0]).toEqual(null);
    expect(window.localStorage.getItem('key-null')).toEqual(null);
  });

  it('reads the existing stored value', () => {
    window.localStorage.setItem('key-existing', JSON.stringify({ shape: 'square' }));

    const { result } = renderHook(() => useLocalStorage<{ shape: string }>('key-existing'));

    expect(result.current[0]).toEqual({ shape: 'square' });
  });

  it('updates both the state and the storage', () => {
    const { result } = renderHook(() => useLocalStorage('key-update', 'circle'));

    act(() => result.current[1]('square'));

    expect(result.current[0]).toEqual('square');
    expect(window.localStorage.getItem('key-update')).toEqual(JSON.stringify('square'));
  });

  it('supports functional updates based on the current stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key-functional', 10));

    act(() => result.current[1]((prev) => (prev ?? 0) + 1));

    expect(result.current[0]).toEqual(11);
  });

  it('removes the item from the storage when set to null', () => {
    const { result } = renderHook(() => useLocalStorage('key-remove', 'circle'));

    expect(window.localStorage.getItem('key-remove')).not.toBeNullish();

    act(() => result.current[1](null));

    expect(window.localStorage.getItem('key-remove')).toEqual(null);
    // with a default value, removing falls back to the default
    expect(result.current[0]).toEqual('circle');
  });

  it('synchronizes every hook instance with the same key', () => {
    const { result } = renderHook(() => useLocalStorage('key-shared', 'initial'));
    const { result: result2 } = renderHook(() => useLocalStorage('key-shared', 'initial'));

    act(() => result.current[1]('changed'));

    expect(result2.current[0]).toEqual('changed');
  });

  it('does not synchronize hooks with different keys', () => {
    const { result } = renderHook(() => useLocalStorage('key-a', 'a'));
    const { result: result2 } = renderHook(() => useLocalStorage('key-b', 'b'));

    act(() => result.current[1]('changed'));

    expect(result2.current[0]).toEqual('b');
  });

  it('responds to cross-document storage events for the same key', () => {
    const { result } = renderHook(() => useLocalStorage('key-cross', 'before'));

    act(() => {
      window.localStorage.setItem('key-cross', JSON.stringify('after'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'key-cross' }));
    });

    expect(result.current[0]).toEqual('after');
  });

  it('handles the browser quirk where StorageEvent is missing the key', () => {
    const { result } = renderHook(() => useLocalStorage('key-quirk', 'before'));

    act(() => {
      window.localStorage.setItem('key-quirk', JSON.stringify('after'));
      // an event without a `key` property triggers the update unconditionally
      window.dispatchEvent(new Event('storage'));
    });

    expect(result.current[0]).toEqual('after');
  });

  it('stores the value as-is with the raw option', () => {
    const { result } = renderHook(() => useLocalStorage('key-raw', 'plain', { raw: true }));

    act(() => result.current[1]('still plain'));

    expect(window.localStorage.getItem('key-raw')).toEqual('still plain');
    expect(result.current[0]).toEqual('still plain');
  });

  it('supports a custom serializer and deserializer', () => {
    const options = {
      serializer: (value: number) => value.toString(16),
      deserializer: (value: string) => Number.parseInt(value, 16)
    };

    const { result } = renderHook(() => useLocalStorage('key-custom', 255, options));

    expect(window.localStorage.getItem('key-custom')).toEqual('ff');

    act(() => result.current[1](16));

    expect(window.localStorage.getItem('key-custom')).toEqual('10');
    expect(result.current[0]).toEqual(16);
  });

  it('uses the default value when rendering on the server', () => {
    function ServerProbe() {
      const [value] = useLocalStorage('key-ssr', 'server');
      return <span>{value}</span>;
    }

    expect(renderToString(<ServerProbe />)).toInclude('server');
  });

  it('bails out to the closest Suspense fallback on the server without a default value', () => {
    function ServerProbe() {
      const [value] = useLocalStorage<string>('key-ssr-bailout');
      return <span>{value}</span>;
    }

    const html = renderToString(
      <Suspense fallback={<span>fallback</span>}>
        <ServerProbe />
      </Suspense>
    );

    expect(html).toInclude('fallback');
  });
});

describe('useSetLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('writes to the storage without subscribing to the value', () => {
    const { result } = renderHook(() => useSetLocalStorage<string>('key-set-only'));

    act(() => result.current('written'));

    expect(window.localStorage.getItem('key-set-only')).toEqual(JSON.stringify('written'));
  });
});
