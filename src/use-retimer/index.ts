import 'client-only';
// useRef is React Client Component only

import { useCallback, useRef } from 'react';

/** @see https://foxact.skk.moe/use-retimer */
export function useRetimer() {
  const timerIdRef = useRef<number>();

  return useCallback((timerId?: number | ReturnType<typeof setTimeout>) => {
    if (typeof timerIdRef.current === 'number') {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = timerId;
  }, []);
}
