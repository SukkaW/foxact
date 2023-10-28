import 'client-only';

import { useCallback, useSyncExternalStore } from 'react';
import { noop } from '../noop';
import { useStableHandler } from '../use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired';

const identity = <T>(x: string) => x as T;

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

function useUrlHashState<T extends string | number>(
  key: string,
  defaultValue?: undefined
): readonly [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
function useUrlHashState<T extends string | number>(
  key: string,
  defaultValue: T,
  transform?: (value: string) => T
): readonly [T, React.Dispatch<React.SetStateAction<T>>];
function useUrlHashState<T extends string | number>(
  key: string,
  defaultValue?: T | undefined,
  transform: (value: string) => T = identity
): readonly [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] {
  const memoized_transform = useStableHandler(transform);

  return [
    useSyncExternalStore(
      subscribe,
      () => {
        const searchParams = new URLSearchParams(location.hash.slice(1));
        const storedValue = searchParams.get(key);
        return storedValue !== null ? transform(storedValue) : defaultValue;
      },
      () => defaultValue
    ),
    useCallback((updater) => {
      const searchParams = new URLSearchParams(location.hash.slice(1));

      const currentHash = location.hash;

      let newValue;

      if (isFunction(updater)) {
        const storedValue = searchParams.get(key);
        newValue = updater(storedValue !== null ? memoized_transform(storedValue) : defaultValue);
      } else {
        newValue = updater;
      }

      if (
        (defaultValue !== undefined && newValue === defaultValue)
        || newValue === undefined
      ) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, JSON.stringify(newValue));
      }

      const newHash = searchParams.toString();

      if (currentHash === newHash) {
        return;
      }

      location.hash = searchParams.toString();
    }, [defaultValue, key, memoized_transform])
  ] as const;
}

export {
  useUrlHashState as unstable_useUrlHashState
};
