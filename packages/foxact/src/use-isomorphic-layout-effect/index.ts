import 'client-only';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- the implementation of useIsomorphicLayoutEffect
import { useEffect, useLayoutEffect as useLayoutEffectFromReact } from 'react';

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffectFromReact;

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useLayoutEffect = useIsomorphicLayoutEffect;
