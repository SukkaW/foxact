import { describe, it } from 'mocha';
import { expect } from 'earl';

import { invariant } from '.';

describe('invariant', () => {
  it('passes when the value is not nullish', () => {
    expect(() => invariant('foxact')).not.toThrow();
    expect(() => invariant(0)).not.toThrow();
    expect(() => invariant(false)).not.toThrow();
  });

  it('throws a TypeError on null and undefined', () => {
    expect(() => invariant(null)).toThrow(TypeError, '[foxact/invariant] "value" is null or undefined');
    expect(() => invariant(undefined)).toThrow(TypeError, '[foxact/invariant] "value" is null or undefined');
  });

  it('throws with a custom message', () => {
    expect(() => invariant(undefined, 'custom message')).toThrow(TypeError, 'custom message');
  });

  it('asserts the type to NonNullable', () => {
    const value: string | undefined = Math.random() < 2 ? 'always' : undefined;
    invariant(value);

    // type-level: after the assertion, value is string
    expect(value.length).toEqual(6);
  });
});
