'use client';

import 'client-only';

import { useContext, useEffect, startTransition } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import type { Navigator } from 'react-router-dom';
import type { Foxact } from '../types';

/** @see https://foxact.skk.moe/use-react-router-enable-concurrent-navigation */
export const useReactRouterEnableConcurrentNavigation = () => {
  const { navigator } = useContext<React.ContextType<typeof UNSAFE_NavigationContext>>(UNSAFE_NavigationContext);

  if (!navigator) {
    throw new TypeError('[foxact/use-react-router-enable-concurrent-navigation] must be used under <RouterProvider /> or a Router component (e.g. <BrowserRouter />)');
  }

  useEffect(() => {
    const originalNavigatorGo = navigator.go.bind(navigator);
    const originalNavigatorPush = navigator.push.bind(navigator);
    const originalNavigatorReplace = navigator.replace.bind(navigator);

    navigator.go = (...args: Parameters<Navigator['go']>) => startTransition(() => originalNavigatorGo.apply(navigator, args));
    navigator.push = (...args: Parameters<Navigator['push']>) => startTransition(() => originalNavigatorPush.apply(navigator, args));
    navigator.replace = (...args: Parameters<Navigator['replace']>) => startTransition(() => originalNavigatorReplace.apply(navigator, args));

    return () => {
      navigator.go = originalNavigatorGo;
      navigator.push = originalNavigatorPush;
      navigator.replace = originalNavigatorReplace;
    };
  }, [navigator]);
};

export const ReactRouterConcurrentNavigationProvider = ({ children }: Foxact.PropsWithChildren) => {
  useReactRouterEnableConcurrentNavigation();

  return children;
};
