import { describe, it } from 'mocha';
import { expect } from 'earl';

import { render } from '@testing-library/react';
import { NoopComponent } from '.';

describe('NoopComponent', () => {
  it('renders nothing', () => {
    const { container } = render(<NoopComponent />);

    expect(container.innerHTML).toEqual('');
  });
});
