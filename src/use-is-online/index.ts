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

const getSnapshot: Parameters<typeof useSyncExternalStore>[1] = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return navigator.onLine;
};

export function usePageVisibility() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
}
