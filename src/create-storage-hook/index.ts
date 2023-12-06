import 'client-only';
import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { noop } from '../noop';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import { noSSRError } from '../no-ssr';

type StorageType = 'localStorage' | 'sessionStorage';
type NotUndefined<T> = T extends undefined ? never : T;

// StorageEvent is deliberately not fired on the same document, we do not want to change that
type CustomStorageEvent = CustomEvent<string>;
declare global {
  interface WindowEventMap {
    'foxact-local-storage': CustomStorageEvent,
    'foxact-session-storage': CustomStorageEvent
  }
}

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

// This type utility is only used for workaround https://github.com/microsoft/TypeScript/issues/37663
// eslint-disable-next-line @typescript-eslint/ban-types -- workaround TypeScript bug
const isFunction = (x: unknown): x is Function => typeof x === 'function';

const identity = (x: any) => x;

export interface UseStorageRawOption {
  raw: true
}

export interface UseStorageParserOption<T> {
  raw?: false,
  serializer: Serializer<T>,
  deserializer: Deserializer<T>
}

const getServerSnapshotWithoutServerValue = () => {
  throw noSSRError('useLocalStorage cannot be used on the server without a serverValue');
};

export function createStorage(type: StorageType) {
  const FOXACT_LOCAL_STORAGE_EVENT_KEY = type === 'localStorage' ? 'foxact-local-storage' : 'foxact-session-storage';

  const dispatchStorageEvent = typeof window !== 'undefined'
    ? (key: string) => {
      window.dispatchEvent(new CustomEvent<string>(FOXACT_LOCAL_STORAGE_EVENT_KEY, { detail: key }));
    }
    : noop;

  const setStorageItem = typeof window !== 'undefined'
    ? (key: string, value: string) => {
      try {
        window[type].setItem(key, value);
      } catch {
        console.warn(`[foxact] Failed to set value to ${type}, it might be blocked`);
      } finally {
        dispatchStorageEvent(key);
      }
    }
    : noop;

  const removeStorageItem = typeof window !== 'undefined'
    ? (key: string) => {
      try {
        window[type].removeItem(key);
      } catch {
        console.warn(`[foxact] Failed to remove value from ${type}, it might be blocked`);
      } finally {
        dispatchStorageEvent(key);
      }
    }
    : noop;

  const getStorageItem = (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window[type].getItem(key);
    } catch {
      console.warn(`[foxact] Failed to get value from ${type}, it might be blocked`);
      return null;
    }
  };

  const useSetStorage = <T>(key: string, serializer: Serializer<T>) => useCallback(
    (v: T | null) => {
      try {
        if (v === null) {
          removeStorageItem(key);
        } else {
          setStorageItem(key, serializer(v));
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, serializer]
  );

  function useStorage<T>(
    key: string,
    serverValue?: NotUndefined<T> | undefined,
    options: UseStorageRawOption | UseStorageParserOption<T> = {
      serializer: JSON.stringify,
      deserializer: JSON.parse
    }
  ) {
    const subscribeToSpecificKeyOfLocalStorage = useCallback((callback: () => void) => {
      if (typeof window === 'undefined') {
        return noop;
      }

      const handleStorageEvent = (e: StorageEvent) => {
        if (
          (!('key' in e)) // Some browsers' strange quirk where StorageEvent is missing key
          || e.key === key
        ) {
          callback();
        }
      };
      const handleCustomStorageEvent = (e: CustomStorageEvent) => {
        if (e.detail === key) {
          callback();
        }
      };

      window.addEventListener('storage', handleStorageEvent);
      window.addEventListener(FOXACT_LOCAL_STORAGE_EVENT_KEY, handleCustomStorageEvent);
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener(FOXACT_LOCAL_STORAGE_EVENT_KEY, handleCustomStorageEvent);
      };
    }, [key]);

    const serializer: Serializer<T> = options.raw ? identity : options.serializer;
    const deserializer: Deserializer<T> = options.raw ? identity : options.deserializer;

    const getClientSnapshot = () => getStorageItem(key);

    // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
    // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
    const getServerSnapshot = serverValue !== undefined
      ? () => serializer(serverValue)
      : getServerSnapshotWithoutServerValue;

    const store = useSyncExternalStore(
      subscribeToSpecificKeyOfLocalStorage,
      getClientSnapshot,
      getServerSnapshot
    );

    const deserialized = useMemo(() => (store === null ? null : deserializer(store)), [store, deserializer]);

    const setState = useCallback<React.Dispatch<React.SetStateAction<T | null>>>(
      (v) => {
        try {
          const nextState = isFunction(v)
            ? v(deserialized ?? null)
            : v;

          if (nextState === null) {
            removeStorageItem(key);
          } else {
            setStorageItem(key, serializer(nextState));
          }
        } catch (e) {
          console.warn(e);
        }
      },
      [key, serializer, deserialized]
    );

    useIsomorphicLayoutEffect(() => {
      if (
        getStorageItem(key) === null
        && serverValue !== undefined
      ) {
        setStorageItem(key, serializer(serverValue));
      }
    }, [deserializer, key, serializer, serverValue]);

    return [deserialized ?? serverValue ?? null, setState] as const;
  }

  return {
    useStorage,
    useSetStorage
  };
}
