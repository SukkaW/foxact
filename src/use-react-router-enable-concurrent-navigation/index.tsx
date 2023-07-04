'use client';

import 'client-only';

import { useContext, useEffect, startTransition } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

/** @see https://foxact.skk.moe/use-react-router-enable-concurrent-navigation */
export const useReactRouterEnableConcurrentNavigation = () => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    const originalNavigatorGo = navigator.go.bind(navigator);
    const originalNavigatorPush = navigator.push.bind(navigator);
    const originalNavigatorReplace = navigator.replace.bind(navigator);

    navigator.go = (...args) => startTransition(() => originalNavigatorGo.apply(navigator, args));
    navigator.push = (...args) => startTransition(() => originalNavigatorPush.apply(navigator, args));
    navigator.replace = (...args) => startTransition(() => originalNavigatorReplace.apply(navigator, args));

    return () => {
      navigator.go = originalNavigatorGo;
      navigator.push = originalNavigatorPush;
      navigator.replace = originalNavigatorReplace;
    };
  }, [navigator]);
};

export const ReactRouterConcurrentNavigationProvider = ({ children }: React.PropsWithChildren) => {
  useReactRouterEnableConcurrentNavigation();

  return children;
};
