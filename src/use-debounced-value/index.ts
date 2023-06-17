import 'client-only';
import { useEffect, useState, useRef } from 'react';

export function useDebouncedValue<T>(value: T, wait: number, leading = false) {
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
