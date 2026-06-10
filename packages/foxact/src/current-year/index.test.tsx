import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { CurrentYear } from '.';

const THIS_YEAR = new Date().getFullYear();

describe('CurrentYear', () => {
  it('renders the current year', () => {
    render(<CurrentYear data-testid="current-year" />);

    expect(screen.getByTestId('current-year').textContent).toEqual(String(THIS_YEAR));
  });

  it('replaces the stale defaultYear with the current year after the layout effect', () => {
    render(<CurrentYear defaultYear={2000} data-testid="current-year" />);

    expect(screen.getByTestId('current-year').textContent).toEqual(String(THIS_YEAR));
  });

  it('renders the defaultYear on the server', () => {
    expect(renderToString(<CurrentYear defaultYear={2000} />)).toInclude('2000');
  });

  it('passes the rest props to the span', () => {
    render(<CurrentYear className="copyright" />);

    expect(screen.getByText(String(THIS_YEAR)).getAttribute('class')).toEqual('copyright');
  });
});
