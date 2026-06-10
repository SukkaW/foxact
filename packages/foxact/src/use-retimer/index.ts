import 'client-only';
// useRef is React Client Component only

import { useCallback, useRef } from 'react';

/** @see https://foxact.skk.moe/use-retimer */
export function useRetimer() {
  const timerIdRef = useRef<number | undefined>(undefined);

  return useCallback((timerId?: number) => {
    if (timerIdRef.current != null) {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = timerId;
  }, []);
}
