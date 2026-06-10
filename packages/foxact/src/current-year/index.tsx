'use client';

import { memo, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';

interface CurrentYearProps extends React.ComponentProps<'span'> {
  defaultYear?: number
}

/** @see https://foxact.skk.moe/current-year */
export const CurrentYear = memo(function CurrentYear({ defaultYear, ...restProps }: CurrentYearProps) {
  /* istanbul ignore if -- SSR-only warning, unreachable when Happy DOM registers window globally in tests */
  if (typeof window === 'undefined' && typeof defaultYear === 'undefined') {
    console.warn('[foxact/current-year] "defaultYear" is required during the server-side rendering.');
  }

  const [year, setYear] = useState(() => defaultYear || new Date().getFullYear());
  useIsomorphicLayoutEffect(() => {
    // This is only allowed because it won't trigger infinite re-render and double render is intentional

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- layout effect and only once
    setYear(new Date().getFullYear());
  }, []);

  return <span {...restProps}>{year}</span>;
});
