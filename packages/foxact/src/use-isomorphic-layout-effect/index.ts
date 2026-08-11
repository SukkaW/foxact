import 'client-only';

// eslint-disable-next-line no-restricted-imports -- the implementation requires React's real layout effect
import { useEffect, useLayoutEffect as useLayoutEffectFromReact } from 'react';

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffectFromReact;

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useLayoutEffect = useIsomorphicLayoutEffect;
