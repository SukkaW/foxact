import 'client-only';

import { useCallback, useRef } from 'react';
import { useDebouncedState } from '../use-debounced-state';

export interface UseResizingOptions {
  timeout?: number,
  leading?: boolean
}

// TODO: once we drop React 19 supports, we can use ref callback cleanup, much simpler, w/o ref.

/** @see https://foxact.skk.moe/use-resizing */
export function useResizing({ timeout = 150, leading = false }: UseResizingOptions = {}): [isResizing: boolean, refCallback: React.RefCallback<Element>] {
  const [isResizing, debouncedSet, forceSet] = useDebouncedState(false, timeout, false);

  const observerRef = useRef<ResizeObserver | null>(null);
  const isFirstRef = useRef(true);

  const refCallback = useCallback((el: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    forceSet(false);
    isFirstRef.current = true;

    if (el) {
      observerRef.current = new ResizeObserver(() => {
        if (isFirstRef.current) {
          isFirstRef.current = false;
          if (!leading) return;
        }

        forceSet(true);
        debouncedSet(false);
      });

      observerRef.current.observe(el);
    }
  }, [leading, forceSet, debouncedSet]);

  return [isResizing, refCallback];
}
