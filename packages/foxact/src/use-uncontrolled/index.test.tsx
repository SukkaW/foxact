import { describe, it } from 'mocha';
import { expect } from 'earl';

import { act, render } from '@testing-library/react';
import { useUncontrolled } from '.';

interface Captured {
  value: string,
  commit: () => void,
  renderCount: number
}

function mount(transformValue?: (value: string) => string, initialValue = 'initial') {
  const captured: Captured = {
    value: '',
    commit() { /* replaced by Probe */ },
    renderCount: 0
  };

  function Probe() {
    const [value, onCommitState, inputRef] = useUncontrolled<string>(initialValue, transformValue);
    captured.value = value;
    captured.commit = onCommitState;
    captured.renderCount++;
    return <input ref={inputRef} />;
  }

  const view = render(<Probe />);
  const input: HTMLInputElement = view.container.querySelector('input')!;

  return { captured, input, view };
}

describe('useUncontrolled', () => {
  it('returns the initial value', () => {
    const { captured } = mount();

    expect(captured.value).toEqual('initial');
  });

  it('does not re-render while the user is typing', () => {
    const { captured, input } = mount();

    input.value = 'typing...';

    expect(captured.renderCount).toEqual(1);
    expect(captured.value).toEqual('initial');
  });

  it('commits the current input value into the state', () => {
    const { captured, input } = mount();

    input.value = 'committed';
    act(() => captured.commit());

    expect(captured.value).toEqual('committed');
  });

  it('applies transformValue when committing', () => {
    const { captured, input } = mount((value) => value.trim());

    input.value = '  foxact  ';
    act(() => captured.commit());

    expect(captured.value).toEqual('foxact');
  });

  it('always uses the latest transformValue passed on re-render', () => {
    const captured: Captured = {
      value: '',
      commit() { /* replaced by Probe */ },
      renderCount: 0
    };

    function Probe({ transform }: { transform: (value: string) => string }) {
      const [value, onCommitState, inputRef] = useUncontrolled<string>('initial', transform);
      captured.value = value;
      captured.commit = onCommitState;
      return <input ref={inputRef} />;
    }

    const view = render(<Probe transform={(value) => `${value}!`} />);
    const input: HTMLInputElement = view.container.querySelector('input')!;

    input.value = 'a';
    act(() => captured.commit());
    expect(captured.value).toEqual('a!');

    // a different, non-memoized transform on a later render must be honored
    view.rerender(<Probe transform={(value) => `${value}?`} />);

    input.value = 'b';
    act(() => captured.commit());
    expect(captured.value).toEqual('b?');
  });

  it('keeps onCommitState stable across re-renders', () => {
    const { captured, input } = mount();
    const commitBefore = captured.commit;

    input.value = 'changed';
    act(() => captured.commit());

    expect(captured.renderCount).toEqual(2);
    expect(captured.commit).toExactlyEqual(commitBefore);
  });

  it('commit is a no-op when no element is attached', () => {
    const captured: Captured = {
      value: '',
      commit() { /* replaced by Probe */ },
      renderCount: 0
    };

    function Probe() {
      const [value, onCommitState] = useUncontrolled<string>('initial');
      captured.value = value;
      captured.commit = onCommitState;
      return null; // the ref is never attached
    }

    render(<Probe />);

    act(() => captured.commit());

    expect(captured.value).toEqual('initial');
  });
});
