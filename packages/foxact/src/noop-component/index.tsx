'use client';

import { Fragment } from 'react';

// eslint-disable-next-line @typescript-eslint/no-restricted-types -- this is return value, not an input option, so we want a more strict type
export function NoopComponent(): React.ReactElement {
  // eslint-disable-next-line @eslint-react/jsx-no-useless-fragment, sukka/jsx-shorthand-fragment -- intentional empty fragment to render nothing
  return <Fragment />;
}
