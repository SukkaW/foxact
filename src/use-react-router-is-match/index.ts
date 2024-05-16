import 'client-only';

import { useContext, useMemo } from 'react';
import { useResolvedPath, UNSAFE_NavigationContext, useLocation } from 'react-router-dom';

import type { To, RelativeRoutingType } from 'react-router-dom';

interface UseReactRouterIsMatchOption {
  relative?: RelativeRoutingType,
  caseSensitive?: boolean,
  end?: boolean
}

const identity = <V>(value: V) => value;

/** @see https://foxact.skk.moe/use-react-router-is-match */
export const useReactRouterIsMatch = (to: To, {
  relative,
  caseSensitive = false,
  end = false
}: UseReactRouterIsMatchOption = {}) => {
  const { pathname: $locationPathname } = useLocation();

  const { navigator: { encodeLocation = identity } } = useContext(UNSAFE_NavigationContext);
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
};
