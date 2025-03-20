import { useCallback } from 'react';
import { useMediaQuery } from '../use-media-query';

export type FastClickReturn<T extends HTMLDivElement | HTMLButtonElement> = Pick<React.DOMAttributes<T>, 'onMouseDown' | 'onClick'>;

/** @see https://foxact.skk.moe/use-fast-click */
export function useFastClick<T extends HTMLDivElement | HTMLButtonElement>(callback: React.MouseEventHandler<T>): FastClickReturn<T> {
  const handler: React.MouseEventHandler<T> = useCallback((e) => {
    // onMouseDown triggers on any mouse click, only respond to "main" clicks
    if (e.type === 'mousedown' && e.button !== 0) {
      return;
    }

    if (
      process.env.NODE_ENV === 'development'
      && !(
        e.currentTarget instanceof HTMLDivElement
        || e.currentTarget instanceof HTMLButtonElement
      )
    ) {
      // eslint-disable-next-line no-console -- in dev only warning
      console.warn('[foxact/use-fast-click] You should only use "useFastClick" on <div /> or <button /> elements');
    }

    callback(e);
  }, [callback]);

  const isTouchEnv = useMediaQuery('(pointer: coarse)', false);

  return isTouchEnv
    ? { onClick: handler }
    : { onMouseDown: handler };
}
