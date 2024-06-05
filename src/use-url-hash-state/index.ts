import 'client-only';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { noop } from '../noop';
import { noSSRError } from '../no-ssr';

type NotUndefined<T> = T extends undefined ? never : T;

const identity = (x: any) => x;

const subscribe: Parameters<typeof useSyncExternalStore>[0] = (() => {
  if (typeof window === 'undefined') {
    return (_callback: () => void) => noop;
  }

  let hasSubscribedToHashChange = false;

  const listeners = new Set<() => void>();

  // call every listener when hash changes
  const handleHashChange = () => {
    listeners.forEach((listener) => listener());
  };

  // subscribe to hash change event by useSyncExternalStore
  return (callback: () => void) => {
    listeners.add(callback);

    if (!hasSubscribedToHashChange) {
      hasSubscribedToHashChange = true;
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      listeners.delete(callback);
    };
  };
})();

// This type utility is only used for workaround https://github.com/microsoft/TypeScript/issues/37663
// eslint-disable-next-line @typescript-eslint/ban-types -- workaround TypeScript bug
const isFunction = (x: unknown): x is Function => typeof x === 'function';

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

export interface UseUrlHashStateRawOption {
  raw: true
}

export interface UseUrlHashStateParserOption<T> {
  raw?: false,
  serializer: Serializer<T>,
  deserializer: Deserializer<T>
}

const getServerSnapshotWithoutServerValue = () => {
  throw noSSRError('useUrlHashState cannot be used on the server without a serverValue');
};

/** @see https://foxact.skk.moe/use-url-hash-state */
function useUrlHashState<T>(
  key: string,
  defaultValue?: NotUndefined<T> | undefined,
  options: UseUrlHashStateRawOption | UseUrlHashStateParserOption<T> = {
    serializer: identity,
    deserializer: identity
  }
) {
  const serializer: Serializer<T> = options.raw ? identity : options.serializer;
  const deserializer: Deserializer<T> = options.raw ? identity : options.deserializer;

  const getClientSnapshot = () => (new URLSearchParams(location.hash.slice(1))).get(key);

  // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
  // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
  const getServerSnapshot = defaultValue !== undefined
    ? () => serializer(defaultValue)
    : getServerSnapshotWithoutServerValue;

  const store = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const deserialized = useMemo(() => (store === null ? (defaultValue ?? null) : deserializer(store)), [defaultValue, deserializer, store]);

  const setState = useCallback((v: React.SetStateAction<T | null>) => {
    const currentHash = location.hash;

    const searchParams = new URLSearchParams(currentHash.slice(1));

    const nextState = isFunction(v)
      ? v(deserialized)
      : v;

    if (
      nextState === defaultValue
      || nextState === null
    ) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, serializer(nextState));
    }

    const newHash = searchParams.toString();

    if (currentHash === newHash) {
      return;
    }

    // eslint-disable-next-line react-compiler/react-compiler -- sync external state
    location.hash = newHash;
  }, [defaultValue, deserialized, key, serializer]);

  return [
    deserialized ?? defaultValue ?? null,
    setState
  ] as const;
}

export {
  useUrlHashState as unstable_useUrlHashState
};
