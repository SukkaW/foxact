'use client';

import { useSyncExternalStore } from 'react';
import { createEventTargetBus } from 'event-target-bus';
import type { EventTargetBus } from 'event-target-bus';
import { noop } from '../noop';

let visibilityChangeBus: EventTargetBus<Document, 'visibilitychange'> | null = null;

const handlePageVisibilityChange: Parameters<typeof useSyncExternalStore>[0] = (onChange) => {
  if (typeof window === 'undefined') return noop;

  visibilityChangeBus ??= createEventTargetBus(document, 'visibilitychange');

  return visibilityChangeBus.on(onChange);
};

const getSnapshot: Parameters<typeof useSyncExternalStore>[1] = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  return !document.hidden;
};

/** @see https://foxact.skk.moe/use-page-visibility */
export function usePageVisibility() {
  return useSyncExternalStore(
    handlePageVisibilityChange,
    getSnapshot,
    getSnapshot
  );
}
