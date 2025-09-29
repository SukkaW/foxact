import 'client-only';

import { identity } from 'foxts/identity';

import { useContext, useMemo } from 'react';
import { useResolvedPath, UNSAFE_NavigationContext, useLocation } from 'react-router-dom';

import type { To, RelativeRoutingType } from 'react-router-dom';

interface UseReactRouterIsMatchOption {
  relative?: RelativeRoutingType,
  caseSensitive?: boolean,
  end?: boolean
}

/** @see https://foxact.skk.moe/use-react-router-is-match */
export function useReactRouterIsMatch(to: To, {
  relative,
  caseSensitive = false,
  end = false
}: UseReactRouterIsMatchOption = {}) {
  const { pathname: $locationPathname } = useLocation();

  const { navigator: { encodeLocation = identity } } = useContext<React.ContextType<typeof UNSAFE_NavigationContext>>(UNSAFE_NavigationContext);
  const path = useResolvedPath(to, { relative });

  return useMemo(() => {
    let locationPathname = $locationPathname;
    let toPathname = encodeLocation(path).pathname;

    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase();
      toPathname = toPathname.toLowerCase();
    }

    return locationPathname === toPathname
      || (
        !end
        && locationPathname.startsWith(toPathname)
        && locationPathname.charAt(toPathname.length) === '/'
      );
  }, [encodeLocation, path, $locationPathname, caseSensitive, end]);
}
