'use client';

import { memo, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';

interface CurrentYearProps extends React.ComponentProps<'span'> {
  defaultYear?: number
}

/** @see https://foxact.skk.moe/current-year */
export const CurrentYear = memo(({ defaultYear, ...restProps }: CurrentYearProps) => {
  if (typeof window === 'undefined') {
    if (typeof defaultYear === 'undefined') {
      console.warn('[foxact/current-year] "defaultYear" is required during the server-side rendering.');
    }
  }

  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  useIsomorphicLayoutEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span {...restProps}>{year}</span>;
});

if (process.env.NODE_ENV !== 'production') {
  CurrentYear.displayName = 'CurrentYear';
}
