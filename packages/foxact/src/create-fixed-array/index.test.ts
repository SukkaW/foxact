import { describe, it } from 'mocha';
import { expect } from 'earl';

import { createFixedArray, createFixedArrayWithGC, createFixedArrayWithoutGC } from '.';

describe('createFixedArray', () => {
  it('creates an ascending array of the given length', () => {
    expect([...createFixedArray(5)]).toEqual([0, 1, 2, 3, 4]);
    expect([...createFixedArray(0)]).toEqual([]);
  });

  it('returns the same instance for the same length', () => {
    expect(createFixedArray(8)).toExactlyEqual(createFixedArray(8));
  });

  it('prefers the WeakRef implementation when available', () => {
    // WeakRef exists in every supported runtime of the test environment
    expect(createFixedArray).toExactlyEqual(createFixedArrayWithGC);
  });
});

describe('createFixedArrayWithoutGC', () => {
  it('creates and caches arrays', () => {
    expect([...createFixedArrayWithoutGC(3)]).toEqual([0, 1, 2]);
    expect(createFixedArrayWithoutGC(3)).toExactlyEqual(createFixedArrayWithoutGC(3));
  });
});

describe('createFixedArrayWithGC', () => {
  it('creates and caches arrays through WeakRef', () => {
    expect([...createFixedArrayWithGC(4)]).toEqual([0, 1, 2, 3]);
    expect(createFixedArrayWithGC(4)).toExactlyEqual(createFixedArrayWithGC(4));
  });
});
