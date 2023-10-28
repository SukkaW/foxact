import 'client-only';
import { useEffect, useState, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types -- explicitly banning ALL functions
type NotFunction<T> = T extends Function ? never : T;

/** @see https://foxact.skk.moe/use-debounced-value */
export function useDebouncedValue<T>(value: NotFunction<T>, wait: number, leading = false) {
  if (typeof value === 'function') {
    throw new TypeError('useDebouncedValue does not support function as value');
  }

  const [outputValue, setOutputValue] = useState(value);
  const leadingRef = useRef(true);

  useEffect(() => {
    let isCancelled = false;
    let timeout: number | null = null;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive of useEffect
    if (!isCancelled) {
      if (leadingRef.current && leading) {
        leadingRef.current = false;
        setOutputValue(value);
      } else {
        timeout = window.setTimeout(() => {
          leadingRef.current = true;
          setOutputValue(value);
        }, wait);
      }
    }

    return () => {
      isCancelled = true;
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [value, leading, wait]);

  return outputValue;
}
