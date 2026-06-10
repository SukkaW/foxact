import { describe, it } from 'mocha';
import { expect } from 'earl';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- compare against the real useLayoutEffect
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
