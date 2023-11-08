import { useSyncExternalStore, useCallback } from 'react';
import { noop } from '../noop';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import { noSSRError } from '../no-ssr';

function dispatchStorageEvent(key: string, newValue: string | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
  }
}

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

const setLocalStorageItem = <T>(key: string, value: any, serializer: Serializer<T>) => {
  if (typeof window !== 'undefined') {
    const stringifiedValue = serializer(value);
    try {
      window.localStorage.setItem(key, stringifiedValue);
    } catch (e) {
      console.error(e);
    } finally {
      dispatchStorageEvent(key, stringifiedValue);
    }
  }
};

const removeLocalStorageItem = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      // Some environments will disallow localStorage access
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    } finally {
      dispatchStorageEvent(key, null);
    }
  }
};

const getLocalStorageItem = <T>(key: string, deserializer: Deserializer<T>) => {
  if (typeof window !== 'undefined') {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? null : deserializer(value);
    } catch (e) {
      console.warn(e);
      return null;
    }
  }
  return null;
};

const subscribeToLocalStorage = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }
  return noop;
};

const getServerSnapshotWithoutServerValue = () => {
  throw noSSRError('useLocalStorage cannot be used on the server without a serverValue');
};

// This type utility is only used for workaround https://github.com/microsoft/TypeScript/issues/37663
// eslint-disable-next-line @typescript-eslint/ban-types -- workaround TypeScript bug
const isFunction = (x: unknown): x is Function => typeof x === 'function';

const identity = (x: any) => x;

export interface UseLocalStorageRawOption {
  raw: true
}

export interface UseLocalStorageParserOption<T> {
  raw?: false,
  serializer: Serializer<T>,
  deserializer: Deserializer<T>
}

type NotUndefined<T> = T extends undefined ? never : T;

/** @see https://foxact.skk.moe/use-local-storage */
export function useLocalStorage<T>(key: string, serverValue?: NotUndefined<T> | undefined, options?: UseLocalStorageRawOption | UseLocalStorageParserOption<NotUndefined<T>>) {
  const serializer: Serializer<T> = options?.raw ? identity : (options?.serializer ?? JSON.stringify);
  const deserializer: Deserializer<T> = options?.raw ? identity : (options?.deserializer ?? JSON.parse);

  const getClientSnapshot = () => getLocalStorageItem<T>(key, deserializer);

  // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
  // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
  const getServerSnapshot = typeof serverValue !== 'undefined'
    ? () => serverValue
    : getServerSnapshotWithoutServerValue;

  const store = useSyncExternalStore(
    subscribeToLocalStorage,
    getClientSnapshot,
    getServerSnapshot
  );

  const setState = useCallback<React.Dispatch<React.SetStateAction<T | null>>>(
    (v) => {
      try {
        const nextState = isFunction(v)
          ? v(store ?? null)
          : v;

        if (nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem<T>(key, nextState, serializer);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, serializer, store]
  );

  useIsomorphicLayoutEffect(() => {
    if (
      getLocalStorageItem<T>(key, deserializer) === null
      && typeof serverValue !== 'undefined'
    ) {
      setLocalStorageItem<T>(key, serverValue, serializer);
    }
  }, [deserializer, key, serializer, serverValue]);

  return [store ?? serverValue ?? null, setState] as const;
}
