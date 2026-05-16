import 'client-only';
import { useState, useRef } from 'react';
import { useEffect } from '../use-abortable-effect';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- allow any function
type NotFunction<T> = T extends Function ? never : T;

/** @see https://foxact.skk.moe/use-debounced-value */
export function useDebouncedValue<T>(value: NotFunction<T>, wait: number, leading = false) {
  if (typeof value === 'function') {
    throw new TypeError('[foxact/use-debounced-value] useDebouncedValue does not support function as value');
  }

  const [outputValue, setOutputValue] = useState(value);
  const leadingRef = useRef(true);

  useEffect(signal => {
    let timeout: number | null = null;

    if (!signal.aborted) {
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        // This only happens when leading is enabled
        // This won't trigger infinitly re-render as long as value is stable

        setOutputValue(value);
      } else {
        timeout = window.setTimeout(() => {
          leadingRef.current = true;
          setOutputValue(value);
        }, wait);
      }
    }

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [value, leading, wait]);

  return outputValue;
}
