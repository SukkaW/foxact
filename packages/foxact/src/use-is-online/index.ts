'use client';

import { useSyncExternalStore } from 'react';
import { createEventTargetBus } from 'event-target-bus';
import type { EventTargetBus } from 'event-target-bus';

let onlineBus: EventTargetBus<Window, 'online'> | null = null;
let offlineBus: EventTargetBus<Window, 'offline'> | null = null;

function subscribe(onStoreChange: () => void): () => void {
  onlineBus ??= createEventTargetBus(window, 'online');
  offlineBus ??= createEventTargetBus(window, 'offline');

  const onlineUnsub = onlineBus.on(onStoreChange);
  const offlineUnsub = offlineBus.on(onStoreChange);

  return () => {
    onlineUnsub();
    offlineUnsub();
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
