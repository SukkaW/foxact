import 'client-only';

import { useEffect, useState } from 'react';

/** @see https://foxact.skk.moe/use-is-client */
export function useIsClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is only allowed because it won't trigger infinite re-render and double render is intentional

    setMounted(true);
  }, []);

  return mounted;
}
