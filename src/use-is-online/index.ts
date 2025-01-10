'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return navigator.onLine;
}

/** @see https://foxact.skk.moe/use-is-online */
export function useIsOnline() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
