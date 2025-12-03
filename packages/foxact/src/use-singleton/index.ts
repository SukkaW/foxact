import 'client-only';

import { useRef } from 'react';

export interface SingletonRefObject<T> {
  readonly current: T
}

/** @see https://foxact.skk.moe/use-singleton */
export function useSingleton<T>(initializor: () => T): SingletonRefObject<T> {
  const r = useRef<T>(null);
  if (r.current == null) {
    r.current = initializor();
  }

  // We are using singleton approach here, to prevent repeated initialization.
  // The value will only be written by the hook during the first render and it
  // should not be written by anyone else anymore
  // @ts-expect-error -- see above
  return r;
}
