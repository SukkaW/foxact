'use client';

import 'client-only';

import { useContext, useEffect, startTransition } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

/** @see https://foxact.skk.moe/use-react-router-enable-concurrent-navigation */
export const useReactRouterEnableConcurrentNavigation = () => {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- type check
  if (!navigator) {
    throw new TypeError('[foxact/use-react-router-enable-concurrent-navigation] must be used under <RouterProvider /> or a Router component (e.g. <BrowserRouter />)');
  }

  useEffect(() => {
    const originalNavigatorGo = navigator.go.bind(navigator);
    const originalNavigatorPush = navigator.push.bind(navigator);
    const originalNavigatorReplace = navigator.replace.bind(navigator);

    // eslint-disable-next-line react-compiler/react-compiler -- mutate context global
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
