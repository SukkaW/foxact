import { describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense, cloneElement, isValidElement, lazy } from 'react';
import { act, render, screen } from '@testing-library/react';
import { getReactChildren } from '.';
import { trapConsoleError } from '../../test/trap-console-error';

interface FlightChunk {
  status: 'pending' | 'fulfilled' | 'rejected',
  value: React.ReactNode,
  reason: unknown,
  listeners: Array<() => void>,
  then(onFulfill: () => void): void
}

function createChunk(
  status: FlightChunk['status'],
  value: React.ReactNode = null,
  reason?: unknown
): FlightChunk {
  return {
    status,
    value,
    reason,
    listeners: [],
    // eslint-disable-next-line sukka/unicorn/no-thenable -- a Flight chunk is intentionally thenable
    then(onFulfill) {
      this.listeners.push(onFulfill);
    }
  };
}

function readChunk(chunk: FlightChunk) {
  if (chunk.status === 'fulfilled') {
    return chunk.value;
  }
  if (chunk.status === 'rejected') {
    throw chunk.reason;
  }

  // eslint-disable-next-line @typescript-eslint/only-throw-error -- a pending Flight chunk suspends by throwing its thenable
  throw chunk;
}

function toLazy(chunk: FlightChunk): React.ReactNode {
  // eslint-disable-next-line sukka/type/no-force-cast-via-top-type -- model the private Flight shape exposed as ReactNode at runtime
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: chunk,
    _init: readChunk
  } as unknown as React.ReactNode;
}

function createLazyChild(children: React.ReactNode) {
  return toLazy(createChunk('fulfilled', children));
}

function createPendingLazyChild(children: React.ReactNode) {
  const chunk = createChunk('pending');
  const resolve = () => {
    chunk.status = 'fulfilled';
    chunk.value = children;
    chunk.listeners.forEach(listener => listener());
  };

  return [toLazy(chunk), resolve] as const;
}

function CloneChild({ children }: React.PropsWithChildren) {
  const child = getReactChildren(children, 1)[0];

  const childClassName = typeof child.props.className === 'string'
    ? child.props.className
    : '';

  // eslint-disable-next-line @eslint-react/no-clone-element -- this models the slot/asChild use case the utility supports
  return cloneElement(child, {
    className: `${childClassName} parent`.trim(),
    'data-merged': 'yes'
  });
}

describe('getReactChildren', () => {
  it('returns a valid React element in an array without changing its identity', () => {
    const child = <span key="child">foxact</span>;
    const result = getReactChildren(child);

    expect(result.length).toEqual(1);
    expect(result[0]).toExactlyEqual(child);
  });

  it('does not initialize an ordinary React.lazy element', () => {
    let initialized = false;
    const LazyChild = lazy(() => {
      initialized = true;
      return Promise.resolve({ default: () => <span>lazy</span> });
    });
    const child = <LazyChild />;

    expect(getReactChildren(child)[0]).toExactlyEqual(child);
    expect(initialized).toEqual(false);
  });

  it('unwraps a fulfilled react.lazy child from the RSC Flight protocol', () => {
    let refValue: HTMLSpanElement | null = null;
    const lazyChild = createLazyChild(
      <span
        ref={(element) => { refValue = element; }}
        className="child"
      >
        foxact
      </span>
    );

    expect(isValidElement(lazyChild)).toEqual(false);

    render(<CloneChild>{lazyChild}</CloneChild>);

    const child = screen.getByText('foxact');
    expect(child.className).toEqual('child parent');
    expect(child.dataset.merged).toEqual('yes');
    expect(refValue!).toExactlyEqual(child);
  });

  it('suspends until a pending react.lazy child resolves', async () => {
    const [lazyChild, resolve] = createPendingLazyChild(<span>resolved</span>);

    // a component suspending inside act requires the act scope to be awaited,
    // RTL render()'s own synchronous act is not enough here
    // eslint-disable-next-line testing-library/no-unnecessary-act -- async act scope is required for suspending components
    await act(async () => {
      render(
        <Suspense fallback={<span>loading</span>}>
          <CloneChild>{lazyChild}</CloneChild>
        </Suspense>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('loading')).not.toBeNullish();
    expect(screen.queryByText('resolved')).toBeNullish();

    await act(async () => {
      resolve();
      await Promise.resolve();
    });

    const child = screen.getByText('resolved');
    expect(child.dataset.merged).toEqual('yes');
  });

  it('propagates a rejected react.lazy child', () => {
    const lazyChild = toLazy(createChunk(
      'rejected',
      null,
      new Error('Flight rejected')
    ));
    const trap = trapConsoleError();

    try {
      expect(() => render(<CloneChild>{lazyChild}</CloneChild>))
        .toThrow(Error, 'Flight rejected');
    } finally {
      trap.restore();
    }
  });

  it('returns every valid element and ignores other React nodes', () => {
    const children = getReactChildren([
      'text',
      null,
      <span key="first">first</span>,
      false,
      <span key="second">second</span>
    ]);

    expect(children.length).toEqual(2);
    // eslint-disable-next-line testing-library/no-node-access -- these are React element props objects, not DOM nodes
    expect(children.map(child => child.props.children)).toEqual(['first', 'second']);
  });

  it('returns every valid element when a lazy child resolves to an array', () => {
    const children = getReactChildren(createLazyChild([
      'text',
      <span key="first" />,
      <span key="second" />
    ]));

    expect(children.length).toEqual(2);
  });

  it('accepts the expected count of valid elements', () => {
    const children = getReactChildren([
      'text',
      <span key="first" />,
      null,
      <span key="second" />
    ], 2);

    expect(children.length).toEqual(2);
  });

  it('throws a TypeError when the valid element count does not match', () => {
    expect(() => getReactChildren([
      'text',
      <span key="only" />
    ], 2)).toThrow(
      TypeError,
      '[foxact/get-react-children] Expected exactly 2 valid React elements, but received 1.'
    );
  });

  it('supports requiring no valid elements', () => {
    expect(getReactChildren(['text', null], 0)).toEqual([]);
  });

  it('rejects an invalid count', () => {
    const invalidCounts = [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY];

    invalidCounts.forEach((count) => {
      expect(() => getReactChildren(null, count)).toThrow(
        TypeError,
        '[foxact/get-react-children] "count" must be a non-negative safe integer.'
      );
    });

    const [pendingLazyChild] = createPendingLazyChild(<span />);
    expect(() => getReactChildren(pendingLazyChild, -1)).toThrow(
      TypeError,
      '[foxact/get-react-children] "count" must be a non-negative safe integer.'
    );
  });

  it('returns an empty array when there are no valid elements', () => {
    expect(getReactChildren(createLazyChild(null))).toEqual([]);
    expect(getReactChildren(createLazyChild('text'))).toEqual([]);
    expect(getReactChildren([null, undefined, false, true, 'text', 0]))
      .toEqual([]);
  });
});
