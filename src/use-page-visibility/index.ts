'use client';

import { useSyncExternalStore } from 'react';

const handlePageVisibilityChange: Parameters<typeof useSyncExternalStore>[0] = (onChange) => {
  document.addEventListener('visibilitychange', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
  };
};

export function usePageVisibility() {
  return useSyncExternalStore(
    handlePageVisibilityChange,
    () => !document.hidden,
    // On server, we always return false
    () => false
  );
}
