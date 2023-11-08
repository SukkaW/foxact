import { useSyncExternalStore, useCallback } from 'react';
import { noop } from '../noop';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import { noSSRError } from '../no-ssr';

function dispatchStorageEvent(key: string, newValue: string | null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
  }
}

const setLocalStorageItem = <T extends string | number>(key: string, value: any, serializer: (value: T) => string) => {
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

const getLocalStorageItem = <T extends string | number>(key: string, deserializer: (value: string) => T) => {
  if (typeof window !== 'undefined') {
    try {
      const value = window.localStorage.getItem(key);
      if (value) {
        return deserializer(value);
      }
      return value;
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

const getLocalStorageParser = <T extends string | number>(options?: UseLocalStorageRawOption | UseLocalStorageParserOption<T>): UseLocalStorageParserOption<T> => {
  if (typeof options === 'undefined') {
    return {
      serializer: JSON.stringify,
      deserializer: JSON.parse
    };
  }
  if ('raw' in options) {
    return {
      serializer: String,
      deserializer: (value: string) => value as T
    };
  }
  if ('serializer' in options && 'deserializer' in options) {
    return options;
  }
  return {
    serializer: JSON.stringify,
    deserializer: JSON.parse
  };
};

interface UseLocalStorageRawOption {
  raw: true
}

interface UseLocalStorageParserOption<T extends string | number> {
  serializer: (value: T) => string,
  deserializer: (value: string) => T
}

/** @see https://foxact.skk.moe/use-local-storage */
export function useLocalStorage<T extends string | number>(key: string, serverValue?: T, options?: UseLocalStorageRawOption | UseLocalStorageParserOption<T>) {
  const { serializer, deserializer } = getLocalStorageParser<T>(options);
  const getSnapshot = () => getLocalStorageItem<T>(key, deserializer) as T | null;

  // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
  // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
  const getServerSnapshot = typeof serverValue !== 'undefined'
    ? () => serverValue
    : getServerSnapshotWithoutServerValue;

  const store = useSyncExternalStore(
    subscribeToLocalStorage,
    getSnapshot,
    getServerSnapshot
  );

  const setState = useCallback<React.Dispatch<React.SetStateAction<T | null>>>(
    (v) => {
      try {
        const nextState = isFunction(v)
          ? v(store ?? null)
          : v;

        if (nextState == null) {
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
