import 'client-only';
import { useSyncExternalStore, useCallback } from 'react';
import { noop } from '../noop';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import { noSSRError } from '../no-ssr';

// StorageEvent is deliberately not fired on the same document, we do not want to change that
const FOXACT_LOCAL_STORAGE_EVENT_KEY = 'foxact-local-storage';
type CustomStorageEvent = CustomEvent<string>;
declare global {
  interface WindowEventMap {
    [FOXACT_LOCAL_STORAGE_EVENT_KEY]: CustomStorageEvent
  }
}

const dispatchStorageEvent = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<string>(FOXACT_LOCAL_STORAGE_EVENT_KEY, { detail: key }));
  }
};

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

const setLocalStorageItem = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    } finally {
      dispatchStorageEvent(key);
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
      dispatchStorageEvent(key);
    }
  }
};

const getLocalStorageItem = (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    console.warn(e);
    return null;
  }
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
export function useLocalStorage<T>(
  key: string,
  serverValue?: NotUndefined<T> | undefined,
  options: UseLocalStorageRawOption | UseLocalStorageParserOption<T> = {
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

  const getClientSnapshot = () => getLocalStorageItem(key);

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

  const deserialized = store === null ? null : deserializer(store);

  const setState = useCallback<React.Dispatch<React.SetStateAction<T | null>>>(
    (v) => {
      try {
        const nextState = isFunction(v)
          ? v(deserialized ?? null)
          : v;

        if (nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, serializer(nextState));
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, serializer, deserialized]
  );

  useIsomorphicLayoutEffect(() => {
    if (
      getLocalStorageItem(key) === null
      && serverValue !== undefined
    ) {
      setLocalStorageItem(key, serializer(serverValue));
    }
  }, [deserializer, key, serializer, serverValue]);

  return [deserialized ?? serverValue ?? null, setState] as const;
}
