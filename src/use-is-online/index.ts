'use client';

import { useSyncExternalStore } from 'react';

const subscribe: Parameters<typeof useSyncExternalStore>[0] = (callback) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getSnapshot: Parameters<typeof useSyncExternalStore<boolean>>[1] = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return navigator.onLine;
};

/** @see https://foxact.skk.moe/use-is-online */
export function useIsOnline() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
