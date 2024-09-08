import 'client-only';

import { useEffect, useState } from 'react';

/** @see https://foxact.skk.moe/use-is-client */
export const useIsClient = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is only allowed because it won't trigger infinite re-render and double render is intentional
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect -- see above
    setMounted(true);
  }, []);

  return mounted;
};
