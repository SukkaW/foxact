import 'client-only';
import { useEffect as useEffectFromReact } from 'react';
import type { EffectCallback, DependencyList } from 'react';

/** @see https://foxact.skk.moe/use-abortable-effect */
export function useAbortableEffect(callback: (signal: AbortSignal) => ReturnType<EffectCallback>, deps: DependencyList) {
  useEffectFromReact(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const f = callback(signal);
    return () => {
      controller.abort();
      f?.();
    };
  }, deps);
}
export const useEffect = useAbortableEffect;
