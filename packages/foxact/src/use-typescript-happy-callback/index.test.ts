import { describe, it } from 'mocha';
import { expect } from 'earl';

import { useCallback as useCallbackFromReact } from 'react';
import { renderHook } from '@testing-library/react';
import { useCallback, useTypeScriptHappyCallback } from '.';

/**
 * earl only asserts at runtime, so the type-level contract is checked with a
 * classic Equal/Expect helper instead: `tsc --noEmit` fails when an assertion
 * below stops holding (the mocha run itself strips types via swc).
 */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

describe('useTypeScriptHappyCallback', () => {
  it('is exactly React.useCallback at runtime', () => {
    expect(useTypeScriptHappyCallback).toEqual(useCallbackFromReact);
  });

  it('exports useCallback as an alias of useTypeScriptHappyCallback', () => {
    expect(useCallback).toExactlyEqual(useTypeScriptHappyCallback);
  });

  it('infers the types of the callback arguments and return value', () => {
    const { result } = renderHook(() => useTypeScriptHappyCallback(
      (event: { value: string }) => event.value.length,
      []
    ));

    // the actual assertion happens at the type level
    type _ = Expect<Equal<typeof result.current, (event: { value: string }) => number>>;

    // ... and a runtime smoke test for good measure
    expect(result.current({ value: 'foxact' })).toEqual(6);
  });
});
