import 'client-only';
import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { noop } from '../noop';
import { useLayoutEffect } from '../use-isomorphic-layout-effect';
import { noSSRError } from '../no-ssr';

import { identity } from 'foxts/identity';
import { isFunction } from 'foxts/is-function';

export type StorageType = 'localStorage' | 'sessionStorage';
export type NotUndefined<T> = T extends undefined ? never : T;

export type StateHookTuple<T> = readonly [T, React.Dispatch<React.SetStateAction<T | null>>];

// StorageEvent is deliberately not fired on the same document, we do not want to change that
type CustomStorageEvent = CustomEvent<string>;
declare global {
  interface WindowEventMap {
    'foxact-use-local-storage': CustomStorageEvent,
    'foxact-use-session-storage': CustomStorageEvent
  }
}

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

export interface UseStorageRawOption {
  raw: true
}

export interface UseStorageParserOption<T> {
  raw?: false,
  serializer: Serializer<T>,
  deserializer: Deserializer<T>
}

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('useLocalStorage cannot be used on the server without a serverValue');
}

export function createStorage(type: StorageType) {
  const FOXACT_LOCAL_STORAGE_EVENT_KEY = type === 'localStorage' ? 'foxact-use-local-storage' : 'foxact-use-session-storage';

  const foxactHookName = type === 'localStorage' ? 'foxact/use-local-storage' : 'foxact/use-session-storage';

  const dispatchStorageEvent = typeof window === 'undefined'
    ? noop
    : (key: string) => {
      window.dispatchEvent(new CustomEvent<string>(FOXACT_LOCAL_STORAGE_EVENT_KEY, { detail: key }));
    };

  const setStorageItem = typeof window === 'undefined'
    ? noop
    : (key: string, value: string) => {
      try {
        window[type].setItem(key, value);
      } catch {
        console.warn(`[${foxactHookName}] Failed to set value to ${type}, it might be blocked`);
      } finally {
        dispatchStorageEvent(key);
      }
    };

  const removeStorageItem = typeof window === 'undefined'
    ? noop
    : (key: string) => {
      try {
        window[type].removeItem(key);
      } catch {
        console.warn(`[${foxactHookName}] Failed to remove value from ${type}, it might be blocked`);
      } finally {
        dispatchStorageEvent(key);
      }
    };

  const getStorageItem = (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window[type].getItem(key);
    } catch {
      console.warn(`[${foxactHookName}] Failed to get value from ${type}, it might be blocked`);
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

  // ssr compatible
  function useStorage<T>(
    key: string,
    serverValue: NotUndefined<T>,
    options?: UseStorageRawOption | UseStorageParserOption<T>
  ): StateHookTuple<T>;
  // client-render only
  function useStorage<T>(
    key: string,
    serverValue?: undefined,
    options?: UseStorageRawOption | UseStorageParserOption<T>
  ): StateHookTuple<T | null>;
  function useStorage<T>(
    key: string,
    serverValue?: NotUndefined<T>,
    // eslint-disable-next-line sukka/unicorn/no-object-as-default-parameter -- two different shape of options
    options: UseStorageRawOption | UseStorageParserOption<T> = {
      raw: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse
    }
  ): StateHookTuple<T> | StateHookTuple<T | null> {
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
    const getServerSnapshot = serverValue === undefined
      ? getServerSnapshotWithoutServerValue
      : () => serializer(serverValue);

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

    useLayoutEffect(() => {
      if (
        getStorageItem(key) === null
        && serverValue !== undefined
      ) {
        setStorageItem(key, serializer(serverValue));
      }
    }, [deserializer, key, serializer, serverValue]);

    const finalValue: T | null = deserialized === null
      // storage doesn't have value
      ? (serverValue === undefined
        // no default value provided
        ? null
        : serverValue satisfies NotUndefined<T>)
      // storage has value
      : deserialized satisfies T;

    return [finalValue, setState] as const;
  }

  return {
    useStorage,
    useSetStorage
  };
}
