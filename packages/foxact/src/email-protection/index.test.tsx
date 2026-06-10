import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { EmailProtection } from '.';

describe('EmailProtection', () => {
  it('renders the real address on the client after the layout effect', () => {
    const { container } = render(<EmailProtection mailbox="hello" domain="example.com" />);

    expect(container.textContent).toEqual('hello@example.com');
  });

  it('renders an obfuscated address on the server', () => {
    const html = renderToString(<EmailProtection mailbox="hello" domain="example.com" />);

    expect(html).not.toInclude('hello@example.com');
    expect(html).not.toInclude('@');
    expect(html).toInclude('[at]');
    expect(html).toInclude('example[dot]com');
    // the mailbox name never appears in the server HTML, only a random placeholder
    expect(html).not.toInclude('hello');
  });
});
