import 'client-only';

import { useRouter } from 'next/router.js';
import { useMemo } from 'react';

/** @see https://foxact.skk.moe/use-next-pathname */
export function useNextPathname(ensureTrailingSlash = false) {
  const { asPath } = useRouter();
  return useMemo(() => {
    const path = asPath.split(/[#?]/)[0];
    if (ensureTrailingSlash) {
      return path.endsWith('/') ? path : `${path}/`;
    }
    return path;
  }, [ensureTrailingSlash, asPath]);
}
