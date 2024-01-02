'use client';

import { memo, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';

interface CurrentYearProps extends React.ComponentProps<'span'> {
  defaultYear?: number
}

function CopyrightYear({ defaultYear, ...restProps }: CurrentYearProps) {
  if (typeof window === 'undefined') {
    if (typeof defaultYear === 'undefined') {
      console.warn('[foxact] "defaultYear" is required during the server-side rendering.');
    }
  }

  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  useIsomorphicLayoutEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span {...restProps}>{year}</span>;
}

export default memo(CopyrightYear);
