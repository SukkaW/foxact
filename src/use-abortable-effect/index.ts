import 'client-only';
import { type EffectCallback, useEffect as useEffectFromReact, type DependencyList } from 'react';

/** @see https://foxact.skk.moe/use-abortable-effect */
export const useAbortableEffect = (callback: (signal: AbortSignal) => ReturnType<EffectCallback>, deps: DependencyList) => {
  useEffectFromReact(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const f = callback(signal);
    return () => {
      controller.abort();
      f?.();
    };
  }, deps);
};
export const useEffect = useAbortableEffect;
