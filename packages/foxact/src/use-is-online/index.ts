'use client';

import { useSyncExternalStore } from 'react';
import { createSyncExternalStoreSubscribe } from 'event-target-bus/react';

const subscribe = createSyncExternalStoreSubscribe(
  () => window,
  ['online', 'offline']
);

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
