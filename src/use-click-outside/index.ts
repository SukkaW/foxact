import 'client-only';
import type { RefObject } from 'react';
import { useRef, useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(cb: () => void): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = ({ target }: MouseEvent) => {
      if (target && ref.current && !ref.current.contains(target as Node)) {
        cb();
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [cb]);

  return ref;
}
