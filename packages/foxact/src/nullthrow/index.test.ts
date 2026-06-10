import { describe, it } from 'mocha';
import { expect } from 'earl';

import { nullthrow } from '.';

describe('nullthrow', () => {
  it('returns the value when it is not nullish', () => {
    expect(nullthrow('foxact')).toEqual('foxact');
    expect(nullthrow(0)).toEqual(0);
    expect(nullthrow(false)).toEqual(false);
    expect(nullthrow('')).toEqual('');
  });

  it('throws a TypeError on null and undefined', () => {
    expect(() => nullthrow(null)).toThrow(TypeError, '[foxact/invariant] "value" is null or undefined');
    expect(() => nullthrow(undefined)).toThrow(TypeError, '[foxact/invariant] "value" is null or undefined');
  });

  it('throws with a custom message', () => {
    expect(() => nullthrow(null, 'custom message')).toThrow(TypeError, 'custom message');
  });

  it('narrows the type to NonNullable', () => {
    const value: string | null = Math.random() < 2 ? 'always' : null;
    const narrowed = nullthrow(value);

    // type-level: narrowed is string, no optional chaining needed
    expect(narrowed.length).toEqual(6);
  });
});
