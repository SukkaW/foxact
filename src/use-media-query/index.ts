'use client';

import { noSSRError } from '../no-ssr';
import { noop } from '../noop';

import { useCallback, useSyncExternalStore } from 'react';

const externalStore = new Map<string, boolean>(); // External store to hold the state of each media query

const subscribeToMediaQuery = (mq: string, callback: VoidFunction) => {
  if (typeof window === 'undefined') return noop;

  const mediaQueryList = window.matchMedia(mq);

  const handleChange = () => {
    // update the store with the latest value of a media query
    externalStore.set(mq, mediaQueryList.matches);
    callback();
  };

  mediaQueryList.addEventListener('change', handleChange); // Add change listener to MediaQueryList

  return () => {
    mediaQueryList.removeEventListener('change', handleChange); // Cleanup function to remove listener
  };
};

const getServerSnapshotWithoutServerValue = () => {
  throw noSSRError('useMediaQuery cannot be used on the server without a serverValue');
};

const useMediaQuery = (mq: string, serverValue?: boolean | undefined): boolean => {
  if (typeof window !== 'undefined' && !externalStore.has(mq)) {
    // This part of the code should only run once per media query, on client-side only
    // we are not on the client-side, let's get initial value directly from DOM
    externalStore.set(mq, window.matchMedia(mq).matches);
  }

  // subscribe once per hook per media query
  const subscribe = useCallback((callback: VoidFunction) => subscribeToMediaQuery(mq, callback), [mq]);

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return externalStore.get(mq) ?? false;
  };
  const getServerSnapshot = serverValue !== undefined
    ? () => serverValue
    : getServerSnapshotWithoutServerValue;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); // Use useSyncExternalStore to manage the subscription and state
};

export default useMediaQuery;
