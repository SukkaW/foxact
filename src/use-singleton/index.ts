import 'client-only';

import { useRef } from 'react';

export interface SingletonRefObject<T> {
  readonly current: T
}

export const useSingleton = <T>(initializor: () => T): SingletonRefObject<T> => {
  const r = useRef<T>();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it will be undefined only on first render
  if (!r.current) {
    r.current = initializor();
  }

  // We are using singleton approach here, to prevent repeated initialization.
  // The value will only be written by the hook during the first render and it
  // should not be written by anyone else
  // @ts-expect-error -- see above
  return r;
};
