import 'client-only';
// useRef is React Client Component only

import { useCallback, useRef } from 'react';

type Timer = number | ReturnType<typeof setTimeout>;

/** @see https://foxact.skk.moe/use-retimer */
export function useRetimer() {
  const timerIdRef = useRef<Timer>();

  return useCallback((timerId?: Timer) => {
    if (typeof timerIdRef.current === 'number') {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = timerId;
  }, []);
}
