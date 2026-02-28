'use client';

import { noSSRError } from '../no-ssr';
import { noop } from '../noop';

import { useCallback, useSyncExternalStore } from 'react';
import { createEventTargetBus } from 'event-target-bus';
import type { EventTargetBus } from 'event-target-bus';

const mediaQueryProxies = new Map<string, EventTargetBus<MediaQueryList, 'change'>>();

function subscribeToMediaQuery(mq: string, callback: VoidFunction) {
  if (typeof window === 'undefined') return noop;

  let bus = mediaQueryProxies.get(mq);
  if (!bus) {
    bus = createEventTargetBus(window.matchMedia(mq), 'change');
    mediaQueryProxies.set(mq, bus);
  }

  return bus.on(callback);
}

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('useMediaQuery cannot be used on the server without a serverValue');
}

/** @see https://foxact.skk.moe/use-media-query */
// eslint-disable-next-line sukka/bool-param-default -- serveValue is intentionally optional
export function useMediaQuery(mq: string, serverValue?: boolean): boolean {
  // subscribe once per hook per media query
  const subscribe = useCallback((callback: VoidFunction) => subscribeToMediaQuery(mq, callback), [mq]);

  const getSnapshot = () => {
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

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); // Use useSyncExternalStore to manage the subscription and state
}
