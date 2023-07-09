import 'client-only';

import { useEffect, useState } from 'react';

/** @see https://foxact.skk.moe/use-is-client */
export const useIsClient = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
