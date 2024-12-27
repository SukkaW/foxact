import 'client-only';
import { useCallback } from 'react';
import type { RefCallback } from 'react';

export function useClickOutside<T extends HTMLElement>(cb: () => void): RefCallback<T> {
  return useCallback((node) => {
    const handleClick = ({ target }: MouseEvent) => {
      if (target && node && !node.contains(target as Node)) {
        cb();
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [cb]);
}
