import 'client-only';

import { noop } from '../noop';
import { useSyncExternalStore } from 'react';

function trueFn() {
  return true;
}
function falseFn() {
  return false;
}

/** @see https://foxact.skk.moe/use-is-client */
export function useIsClient() {
  return useSyncExternalStore(
    noop,
    trueFn,
    falseFn
  );
}
