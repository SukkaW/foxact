import { describe, it } from 'mocha';
import { expect } from 'earl';

import { fireEvent, render, screen } from '@testing-library/react';
import { useCompositionInput } from '.';

function mount() {
  const received: string[] = [];

  function Probe() {
    const props = useCompositionInput((value) => { received.push(value); });
    return <input {...props} />;
  }

  render(<Probe />);
  const input: HTMLInputElement = screen.getByRole('textbox');

  return { received, input };
}

describe('useCompositionInput', () => {
  it('emits on normal input', () => {
    const { received, input } = mount();

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });

    expect(received).toEqual(['a', 'ab']);
  });

  it('does not emit intermediate values during IME composition, emits once on composition end', () => {
    const { received, input } = mount();

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'ｓ' } });
    fireEvent.change(input, { target: { value: 'す' } });
    fireEvent.change(input, { target: { value: 'すし' } });

    // nothing is emitted while compositioning
    expect(received).toEqual([]);

    fireEvent.compositionEnd(input);

    // only the final value is emitted
    expect(received).toEqual(['すし']);
  });

  it('does not double-emit when the change event arrives after compositionend (Chrome v53+)', () => {
    const { received, input } = mount();

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'す' } });
    // Chrome v53+ fires compositionend BEFORE the last change event
    fireEvent.compositionEnd(input);
    fireEvent.change(input, { target: { value: 'す' } });

    expect(received).toEqual(['す']);
  });

  it('resumes normal emitting after the composition has ended', () => {
    const { received, input } = mount();

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'す' } });
    fireEvent.compositionEnd(input);

    fireEvent.change(input, { target: { value: 'すa' } });

    expect(received).toEqual(['す', 'すa']);
  });
});
