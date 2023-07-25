import 'client-only';
// useRef is React Client Component only

import { useCallback, useRef } from 'react';

/** @see https://foxact.skk.moe/use-retimer */
export const useRetimer = () => {
  const timerIdRef = useRef<number>();

  const retimer = useCallback((timerId: number) => {
    if (typeof timerIdRef.current === 'number') {
      clearTimeout(timerIdRef.current);
    }
    timerIdRef.current = timerId;
  }, []);

  const clearRetimer = useCallback(() => {
    clearTimeout(timerIdRef.current);
    timerIdRef.current = undefined;
  }, []);

  return [retimer, clearRetimer] as const;
};
