import 'client-only';
// useRef is React Client Component only

import { useCallback, useRef } from 'react';

/** @see https://foxact.skk.moe/use-retimer */
export const useRetimer = () => {
  const timerIdRef = useRef<number>();

  return useCallback((timerId?: number) => {
    if (typeof timerIdRef.current === 'number') {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = timerId;
  }, []);
};
