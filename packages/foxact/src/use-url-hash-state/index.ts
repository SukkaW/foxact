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

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('useUrlHashState cannot be used on the server without a serverValue');
}

/** @see https://foxact.skk.moe/use-url-hash-state */
function useUrlHashState<T>(
  key: string,
  defaultValue?: NotUndefined<T>,
  // eslint-disable-next-line sukka/unicorn/no-object-as-default-parameter -- two different shape of options
  options: UseUrlHashStateRawOption | UseUrlHashStateParserOption<T> = {
    raw: false,
    serializer: identity,
    deserializer: identity
  }
) {
  const serializer: Serializer<T> = options.raw ? identity : options.serializer;
  const deserializer: Deserializer<T> = options.raw ? identity : options.deserializer;

  const getClientSnapshot = () => (new URLSearchParams(location.hash.slice(1))).get(key);

  // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
  // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
  const getServerSnapshot = defaultValue === undefined
    ? getServerSnapshotWithoutServerValue
    : () => serializer(defaultValue);

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
