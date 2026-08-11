import { describe, it } from 'mocha';
import { expect } from 'earl';

// eslint-disable-next-line no-restricted-imports -- compare against React's real layout effect
import { useLayoutEffect as useLayoutEffectFromReact } from 'react';
import { useIsomorphicLayoutEffect, useLayoutEffect } from '.';

describe('useIsomorphicLayoutEffect', () => {
  it('is React.useLayoutEffect in a DOM environment', () => {
    expect(useIsomorphicLayoutEffect).toExactlyEqual(useLayoutEffectFromReact);
  });

  it('exports useLayoutEffect as an alias', () => {
    expect(useLayoutEffect).toExactlyEqual(useIsomorphicLayoutEffect);
  });
});
