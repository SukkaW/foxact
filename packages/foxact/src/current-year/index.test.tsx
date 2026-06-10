import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { CurrentYear } from '.';

const THIS_YEAR = new Date().getFullYear();

describe('CurrentYear', () => {
  it('renders the current year', () => {
    const { container } = render(<CurrentYear />);

    expect(container.textContent).toEqual(String(THIS_YEAR));
  });

  it('replaces the stale defaultYear with the current year after the layout effect', () => {
    const { container } = render(<CurrentYear defaultYear={2000} />);

    expect(container.textContent).toEqual(String(THIS_YEAR));
  });

  it('renders the defaultYear on the server', () => {
    expect(renderToString(<CurrentYear defaultYear={2000} />)).toInclude('2000');
  });

  it('passes the rest props to the span', () => {
    const { container } = render(<CurrentYear className="copyright" />);

    expect(container.querySelector('span.copyright')).not.toBeNullish();
  });
});
