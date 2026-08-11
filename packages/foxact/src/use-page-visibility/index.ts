'use client';

import { useSyncExternalStore } from 'react';
import { createSyncExternalStoreSubscribe } from 'event-target-bus/react';

const subscribe = createSyncExternalStoreSubscribe(
  () => document,
  'visibilitychange'
);

const getSnapshot: Parameters<typeof useSyncExternalStore>[1] = () => {
  /* istanbul ignore if -- SSR-only guard, unreachable when Happy DOM registers document globally in tests */
  if (typeof document === 'undefined') {
    return false;
  }

  return !document.hidden;
};

/** @see https://foxact.skk.moe/use-page-visibility */
export function usePageVisibility() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
