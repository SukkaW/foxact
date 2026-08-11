import 'client-only';

import { noop } from '../noop';
import { useSyncExternalStore } from 'react';
import { falseFn, trueFn } from 'foxts/noop';

/** @see https://foxact.skk.moe/use-is-client */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    trueFn,
    falseFn
  );
}
