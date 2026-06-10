import { describe, it } from 'mocha';
import { expect } from 'earl';

import { createConverter, em, mantine_rem, rem } from '.';

describe('rem', () => {
  it('converts numbers based on a 16px root font size', () => {
    expect(rem(16)).toEqual('1rem');
    expect(rem(24)).toEqual('1.5rem');
    expect(rem(-8)).toEqual('-0.5rem');
  });

  it('returns "0" for zero', () => {
    expect(rem(0)).toEqual('0');
    expect(rem('0')).toEqual('0');
  });

  it('converts px strings', () => {
    expect(rem('32px')).toEqual('2rem');
  });

  it('passes through values already in rem', () => {
    expect(rem('1.5rem')).toEqual('1.5rem');
  });

  it('converts arrays and space-separated values', () => {
    expect(rem([16, 32])).toEqual('1rem 2rem');
    expect(rem('16px 32px')).toEqual('1rem 2rem');
  });

  it('passes through calc/var/clamp expressions', () => {
    expect(rem('calc(100% - 1rem)')).toEqual('calc(100% - 1rem)');
    expect(rem('var(--size)')).toEqual('var(--size)');
    expect(rem('clamp(1rem, 2vw, 2rem)')).toEqual('clamp(1rem, 2vw, 2rem)');
  });

  it('passes through non-numeric values', () => {
    expect(rem('auto')).toEqual('auto');
  });
});

describe('em', () => {
  it('converts to em units', () => {
    expect(em(16)).toEqual('1em');
    expect(em('24px')).toEqual('1.5em');
  });
});

describe('mantine_rem', () => {
  it('scales by the mantine scale variable', () => {
    expect(mantine_rem(16)).toEqual('calc(1rem * var(--mantine-scale))');
  });
});

describe('createConverter', () => {
  it('supports a custom root font size', () => {
    const remWith10 = createConverter('rem', null, 10);

    expect(remWith10(15)).toEqual('1.5rem');
  });

  it('supports a custom scale target', () => {
    const scaled = createConverter('rem', 'var(--my-scale)');

    expect(scaled(16)).toEqual('calc(1rem * var(--my-scale))');
  });
});
