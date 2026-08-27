import { describe, it } from 'mocha';
import { expect } from 'earl';

import { getSingleReactChildren } from '.';

function createLazyChild(children: React.ReactNode): React.ReactNode {
  // eslint-disable-next-line sukka/type/no-force-cast-via-top-type -- model the private Flight shape exposed as ReactNode at runtime
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: children,
    _init: (payload: React.ReactNode) => payload
  } as unknown as React.ReactNode;
}

describe('getSingleReactChildren', () => {
  it('returns a direct React element without changing its identity', () => {
    const child = <span key="child">foxact</span>;

    expect(getSingleReactChildren(child)).toExactlyEqual(child);
  });

  it('returns the only valid element among other React nodes', () => {
    const child = getSingleReactChildren([
      'text',
      null,
      <span key="child">single</span>,
      false
    ]);

    expect(child.props.children).toEqual('single');
  });

  it('unwraps a fulfilled react.lazy child from the RSC Flight protocol', () => {
    const child = getSingleReactChildren(
      createLazyChild(<span>lazy child</span>)
    );

    expect(child.props.children).toEqual('lazy child');
  });

  it('throws when there is no valid React element', () => {
    expect(() => getSingleReactChildren(['text', null])).toThrow(
      TypeError,
      '[foxact/get-react-children] Expected exactly 1 valid React element, but received 0.'
    );
  });

  it('throws when there is more than one valid React element', () => {
    expect(() => getSingleReactChildren([
      <span key="first" />,
      <span key="second" />
    ])).toThrow(
      TypeError,
      '[foxact/get-react-children] Expected exactly 1 valid React element, but received 2.'
    );
  });
});
