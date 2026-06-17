import { describe, it } from 'mocha';
import { expect } from 'earl';

import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useComponentWillReceiveUpdate } from '.';

// Usage-oriented probe, modeled after the documented use case: an editable
// draft state that re-synchronizes whenever the `source` prop changes
function DraftInput({ source }: { source: string }) {
  const [draft, setDraft] = useState(source);
  useComponentWillReceiveUpdate(() => setDraft(source), [source]);

  return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
}

function mount(initialSource: string) {
  const view = render(<DraftInput source={initialSource} />);
  const input: HTMLInputElement = screen.getByRole('textbox');

  return { view, input };
}

describe('useComponentWillReceiveUpdate', () => {
  it('keeps the local state on the initial render', () => {
    const { input } = mount('hello');

    expect(input.value).toEqual('hello');
  });

  it('keeps the user edits while the props stay the same', () => {
    const { view, input } = mount('hello');

    fireEvent.change(input, { target: { value: 'user typed' } });
    expect(input.value).toEqual('user typed');

    view.rerender(<DraftInput source="hello" />);

    expect(input.value).toEqual('user typed');
  });

  it('re-synchronizes the local state when the props change', () => {
    const { view, input } = mount('hello');

    fireEvent.change(input, { target: { value: 'user typed' } });

    view.rerender(<DraftInput source="changed" />);

    // the state "syncs" to the new prop, discarding the stale draft
    expect(input.value).toEqual('changed');
  });

  it('invokes the callback synchronously during render, before the children update', () => {
    const log: string[] = [];

    function Probe({ dep }: { dep: string }) {
      useComponentWillReceiveUpdate(() => { log.push(`sync:${dep}`); }, [dep]);
      log.push(`render:${dep}`);
      return null;
    }

    const view = render(<Probe dep="a" />);
    expect(log).toEqual(['render:a']);

    view.rerender(<Probe dep="b" />);

    // the callback fires during the render that observed the change
    expect(log[1]).toEqual('sync:b');
  });
});
