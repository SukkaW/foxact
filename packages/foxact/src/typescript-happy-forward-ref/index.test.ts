import { describe, it } from 'mocha';
import { expect } from 'earl';

import { forwardRef } from 'react';
import { typeScriptHappyForwardRef, typescriptHappyForwardRef } from '.';

// being exactly React.forwardRef at runtime is the entire contract, only the
// types differ; no functional testing needed
describe('typescriptHappyForwardRef', () => {
  it('is exactly React.forwardRef at runtime, in both casings', () => {
    expect(typeScriptHappyForwardRef).toExactlyEqual(forwardRef as typeof typeScriptHappyForwardRef);
    expect(typescriptHappyForwardRef).toExactlyEqual(typeScriptHappyForwardRef);
  });
});
