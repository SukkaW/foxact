import 'client-only';

import { useEffect, useState } from 'react';

export const useIsClient = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
