import 'client-only';
import { useCallback, useRef, useState } from 'react';
import { useRetimer } from '../use-retimer';

export function useDebouncedState<T>(defaultValue: T | (() => T), wait: number, leading = false) {
  const [value, setValue] = useState<T>(defaultValue);
  const leadingRef = useRef(true);
  const retimer = useRetimer();

  const debouncedSetValue = useCallback((newValue: T) => {
    if (leadingRef.current && leading) {
      setValue(newValue);
    } else {
      retimer(window.setTimeout(() => {
        leadingRef.current = true;
        setValue(newValue);
      }, wait));
    }
    leadingRef.current = false;
  }, [leading, retimer, wait]);

  return [value, debouncedSetValue] as const;
}
