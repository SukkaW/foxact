/* eslint-disable vibe-proof/react-prefer-foxact-use-media-query -- this module implements foxact/use-media-query */
'use client';

import { noSSRError } from '../no-ssr';

import { useMemo, useSyncExternalStore } from 'react';
import { createKeyedSyncExternalStoreSubscribe } from 'event-target-bus/react';

const getMediaQuerySubscribe = createKeyedSyncExternalStoreSubscribe(
  (mq: string) => window.matchMedia(mq),
  'change'
);

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('useMediaQuery cannot be used on the server without a serverValue');
}

/** @see https://foxact.skk.moe/use-media-query */
// eslint-disable-next-line sukka/bool-param-default -- serveValue is intentionally optional
export function useMediaQuery(mq: string, serverValue?: boolean): boolean {
  const getSnapshot = () => {
    /* istanbul ignore if -- SSR-only guard, unreachable when Happy DOM registers window globally in tests */
    if (typeof window === 'undefined') {
      if (serverValue != null) {
        return serverValue;
      }
      return false;
    }
    // Always get the current value from the DOM
    return window.matchMedia(mq).matches;
  };
  const getServerSnapshot = serverValue === undefined
    ? getServerSnapshotWithoutServerValue
    : () => serverValue;

  // ensure stableness per mq
  const subscribe = useMemo(() => getMediaQuerySubscribe(mq), [mq]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); // Use useSyncExternalStore to manage the subscription and state
}
