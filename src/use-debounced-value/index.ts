import 'client-only';
import { useEffect, useState, useRef } from 'react';

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
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        // This only happens when leading is enabled
        // This won't trigger infinitly re-render as long as value is stable
        // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect -- see above
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
