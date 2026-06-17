import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { fireEvent, render, screen } from '@testing-library/react';
import { useFastClick } from '.';

// eslint-disable-next-line sukka/bool-param-default -- undefined means "do not stub matchMedia"
function mount(matchMediaOverride?: boolean) {
  if (matchMediaOverride !== undefined) {
    // use-media-query caches one bus per query string, so use a fresh fake
    // MediaQueryList for the touch-environment case
    const fakeMql = {
      matches: matchMediaOverride,
      addEventListener() { /* noop */ },
      removeEventListener() { /* noop */ }
    };
    window.matchMedia = (() => fakeMql) as unknown as typeof window.matchMedia;
  }

  const clicks: string[] = [];

  function Probe() {
    const props = useFastClick<HTMLButtonElement>((e) => { clicks.push(e.type); });
    return <button type="button" {...props}>fast</button>;
  }

  render(<Probe />);
  const button: HTMLButtonElement = screen.getByRole('button');

  return { clicks, button };
}

const originalMatchMedia = window.matchMedia;

describe('useFastClick', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('responds to mousedown instead of click in non-touch environments', () => {
    const { clicks, button } = mount();

    fireEvent.mouseDown(button, { button: 0 });
    expect(clicks).toEqual(['mousedown']);

    // plain click must not double-fire
    fireEvent.click(button, { button: 0 });
    expect(clicks).toEqual(['mousedown']);
  });

  it('ignores non-main mouse buttons', () => {
    const { clicks, button } = mount();

    fireEvent.mouseDown(button, { button: 1 });
    fireEvent.mouseDown(button, { button: 2 });

    expect(clicks).toEqual([]);
  });

  it('responds to click in touch environments (pointer: coarse)', () => {
    const { clicks, button } = mount(true);

    fireEvent.click(button, { button: 0 });
    expect(clicks).toEqual(['click']);

    fireEvent.mouseDown(button, { button: 0 });
    expect(clicks).toEqual(['click']);
  });
});
