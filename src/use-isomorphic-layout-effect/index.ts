import 'client-only';

import { useEffect, useLayoutEffect as useLayoutEffectFromReact } from 'react';

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined'
  ? useLayoutEffectFromReact
  : useEffect;

/** @see https://foxact.skk.moe/use-isomorphic-layout-effect */
export const useLayoutEffect = useIsomorphicLayoutEffect;
