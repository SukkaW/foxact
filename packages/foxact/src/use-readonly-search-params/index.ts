import { createEventTargetBus } from 'event-target-bus';
import type { EventTargetBus } from 'event-target-bus';
import { noSSRError } from '../no-ssr';
import { noop } from '../noop';
import { useSyncExternalStore } from 'react';

class ReadonlyURLSearchParamsError extends Error {
  name = 'ReadonlyURLSearchParamsError';
  constructor() {
    super(
      '[foxact/use-readonly-search-params] Method unavailable on `ReadonlyURLSearchParams`'
    );
  }
}

export class ReadonlyURLSearchParams extends URLSearchParams {
  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  append(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  delete(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  set(): never {
    throw new ReadonlyURLSearchParamsError();
  }

  /** @deprecated Method unavailable on `ReadonlyURLSearchParams`. Read more: https://foxact.skk.moe/use-readonly-search-params */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- overriden
  sort(): never {
    throw new ReadonlyURLSearchParamsError();
  }
}

let popStateBus: EventTargetBus<Window, 'popstate'> | null = null;

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return noop;

  popStateBus ??= createEventTargetBus(window, 'popstate');

  return popStateBus.on(onStoreChange);
}

let lastSearch: string | null = null;
let lastUrlSearchParams: ReadonlyURLSearchParams | null = null;

function getClientSnapshot() {
  if (typeof window === 'undefined') {
    return new ReadonlyURLSearchParams();
  }

  if (window.location.search === lastSearch && lastUrlSearchParams !== null) {
    return lastUrlSearchParams;
  }

  lastSearch = window.location.search;
  lastUrlSearchParams = new ReadonlyURLSearchParams(lastSearch);
  return lastUrlSearchParams;
}

function getServerSnapshotWithoutServerValue(): never {
  throw noSSRError('[foxact] useReadonlySearchParams cannot be used on the server without a "getServerDefaultValue" function');
}

/** @see https://foxact.skk.moe/use-readonly-search-params */
export function useReadonlySearchParams(
  getServerDefaultValue?: () => URLSearchParams | ReadonlyURLSearchParams
) {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerDefaultValue == null
      ? getServerSnapshotWithoutServerValue
      : () => {
        const serverDefaultValue = getServerDefaultValue();
        return serverDefaultValue instanceof ReadonlyURLSearchParams
          ? serverDefaultValue
          : new ReadonlyURLSearchParams(serverDefaultValue);
      }
  );
}
