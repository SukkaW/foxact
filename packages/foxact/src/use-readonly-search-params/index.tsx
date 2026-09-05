'use client';
// Provider must be client component

import { createSyncExternalStoreSubscribe } from 'event-target-bus/react';
import { noSSRError } from '../no-ssr';
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

class ReadonlyURLSearchParamsError extends Error {
  name = 'ReadonlyURLSearchParamsError';
  constructor() {
    super(
      '[foxact/use-readonly-search-params] Method unavailable on `ReadonlyURLSearchParams`'
    );
  }
}

export class ReadonlyURLSearchParams extends URLSearchParams {
  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  append(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  delete(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  set(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  sort(): never {
    throw new ReadonlyURLSearchParamsError();
  }
}

const subscribeToPopState = createSyncExternalStoreSubscribe(() => window, 'popstate');

const defaultContextValue = {
  hasProvider: false,
  subscribe: subscribeToPopState
};
const ReadonlySearchParamsContext = createContext(defaultContextValue);

function createHistoryApiStore() {
  const listeners = new Set<() => void>();

  return {
    contextValue: {
      hasProvider: true,
      subscribe: ((onStoreChange: () => void) => {
        const unsubscribeFromPopState = subscribeToPopState(onStoreChange);
        listeners.add(onStoreChange);

        return () => {
          unsubscribeFromPopState();
          listeners.delete(onStoreChange);
        };
      }) satisfies typeof subscribeToPopState
    },
    notify: () => listeners.forEach(listener => listener())
  };
}

let mountedRootProviderCountInDevelopment = 0;

function patchHistoryApi(notify: () => void) {
  const history = window.history;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- restored verbatim when the provider unmounts
  const originalPushState = history.pushState;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- restored verbatim when the provider unmounts
  const originalReplaceState = history.replaceState;

  const patchedPushState: History['pushState'] = function patchedPushState(
    this: History,
    ...args: Parameters<History['pushState']>
  ) {
    originalPushState.apply(this, args);
    notify();
  };
  const patchedReplaceState: History['replaceState'] = function patchedReplaceState(
    this: History,
    ...args: Parameters<History['replaceState']>
  ) {
    originalReplaceState.apply(this, args);
    notify();
  };

  history.pushState = patchedPushState;
  history.replaceState = patchedReplaceState;

  return () => {
    // Do not overwrite another library's patch if it replaced ours after mount.
    if (history.pushState === patchedPushState) {
      history.pushState = originalPushState;
    }
    if (history.replaceState === patchedReplaceState) {
      history.replaceState = originalReplaceState;
    }
  };
}

/**
 * Opts descendant `useReadonlySearchParams` hooks into updates made through
 * `history.pushState` and `history.replaceState`.
 *
 * @see https://foxact.skk.moe/use-readonly-search-params
 */
export function ReadonlySearchParamsProvider({ children }: React.PropsWithChildren): React.ReactNode {
  const parentContextValue = useContext(ReadonlySearchParamsContext);
  const historyApiStore = useMemo(() => createHistoryApiStore(), []);

  useEffect(() => {
    if (parentContextValue.hasProvider) {
      return;
    }

    if (
      process.env.NODE_ENV !== 'production'
      && mountedRootProviderCountInDevelopment > 0
    ) {
      throw new Error(
        '[foxact/use-readonly-search-params] Multiple non-nested ReadonlySearchParamsProvider instances are mounted. Use a single top-level provider or nest them.'
      );
    }

    const cleanupHistoryApiPatch = patchHistoryApi(historyApiStore.notify);
    if (process.env.NODE_ENV !== 'production') {
      mountedRootProviderCountInDevelopment += 1;
    }

    return () => {
      cleanupHistoryApiPatch();
      if (process.env.NODE_ENV !== 'production') {
        mountedRootProviderCountInDevelopment -= 1;
      }
    };
  }, [historyApiStore, parentContextValue.hasProvider]);

  return (
    <ReadonlySearchParamsContext.Provider
      value={
        parentContextValue.hasProvider
          ? parentContextValue
          : historyApiStore.contextValue
      }
    >
      {children}
    </ReadonlySearchParamsContext.Provider>
  );
}

let lastSearch: string | null = null;
let lastUrlSearchParams: ReadonlyURLSearchParams | null = null;

function getClientSnapshot() {
  /* istanbul ignore if -- SSR-only guard, unreachable when Happy DOM registers window globally in tests */
  if (typeof window === 'undefined') {
    return new ReadonlyURLSearchParams();
  }

  if (lastUrlSearchParams !== null && window.location.search === lastSearch) {
    return lastUrlSearchParams;
  }

  lastSearch = window.location.search;
  lastUrlSearchParams = new ReadonlyURLSearchParams(lastSearch);
  return lastUrlSearchParams;
}

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('[foxact] useReadonlySearchParams cannot be used on the server without a "getServerDefaultValue" function');
}

/** @see https://foxact.skk.moe/use-readonly-search-params */
export function useReadonlySearchParams(
  getServerDefaultValue?: () => URLSearchParams | ReadonlyURLSearchParams
) {
  const { subscribe } = useContext(ReadonlySearchParamsContext);

  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerDefaultValue == null
      ? getServerSnapshotWithoutServerValue
      : () => {
        const serverDefaultValue = getServerDefaultValue();
        return serverDefaultValue instanceof ReadonlyURLSearchParams
          ? serverDefaultValue
          : new ReadonlyURLSearchParams(serverDefaultValue);
      }
  );
}
