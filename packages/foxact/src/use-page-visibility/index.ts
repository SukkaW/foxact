'use client';

import { useSyncExternalStore } from 'react';

const handlePageVisibilityChange: Parameters<typeof useSyncExternalStore>[0] = (onChange) => {
  document.addEventListener('visibilitychange', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
  };
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
