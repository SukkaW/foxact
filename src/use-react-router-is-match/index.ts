import 'client-only';

import { useContext, useMemo } from 'react';
import { useResolvedPath, UNSAFE_NavigationContext, useLocation } from 'react-router-dom';

import type { To, RelativeRoutingType } from 'react-router-dom';

interface UseReactRouterIsMatchOption {
  relative?: RelativeRoutingType,
  caseSensitive?: boolean,
  end?: boolean
}

/** @see https://foxact.skk.moe/use-react-router-is-match */
export const useReactRouterIsMatch = (to: To, {
  relative,
  caseSensitive = false,
  end = false
}: UseReactRouterIsMatchOption) => {
  const { pathname: $locationPathname } = useLocation();

  const { navigator: { encodeLocation } } = useContext(UNSAFE_NavigationContext);
  const path = useResolvedPath(to, { relative });

  return useMemo(() => {
    let locationPathname = $locationPathname;
    let toPathname = encodeLocation
      ? encodeLocation(path).pathname
      : path.pathname;

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
};
