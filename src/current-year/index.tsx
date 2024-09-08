'use client';

import { memo, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import type { Foxact } from '../types';

interface CurrentYearProps extends Foxact.ComponentProps<'span'> {
  defaultYear?: number
}

/** @see https://foxact.skk.moe/current-year */
export const CurrentYear = memo(({ defaultYear, ...restProps }: Readonly<CurrentYearProps>) => {
  if (typeof window === 'undefined' && typeof defaultYear === 'undefined') {
    console.warn('[foxact/current-year] "defaultYear" is required during the server-side rendering.');
  }

  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  useIsomorphicLayoutEffect(() => {
    // This is only allowed because it won't trigger infinite re-render and double render is intentional
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect -- see above
    setYear(new Date().getFullYear());
  }, []);

  return <span {...restProps}>{year}</span>;
});

if (process.env.NODE_ENV !== 'production') {
  CurrentYear.displayName = 'CurrentYear';
}
