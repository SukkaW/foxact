import { Children, isValidElement } from 'react';

function assertValidCount(count: number) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new TypeError(
      '[foxact/get-react-children] "count" must be a non-negative safe integer.'
    );
  }
}

function assertCount(count: number, actualCount: number) {
  if (actualCount !== count) {
    throw new TypeError(
      `[foxact/get-react-children] Expected exactly ${count} valid React ${count === 1 ? 'element' : 'elements'}, but received ${actualCount}.`
    );
  }
}

/**
 * Returns every valid React element in children, unwrapping the lazy wrapper
 * that React Flight can place around children crossing a React Server
 * Components boundary.
 *
 * @see https://foxact.skk.moe/get-react-children
 * @see https://github.com/react/react/issues/32392
 */
export function getReactChildren(
  children: React.ReactNode,
  count?: number
) {
  if (count !== undefined) {
    assertValidCount(count);
  }

  const result = isValidElement<Record<string, unknown>>(children)
    ? [children]
    // eslint-disable-next-line @eslint-react/no-children-to-array -- React uses this path to initialize lazy Flight children
    : Children.toArray(children)
      .filter(isValidElement<Record<string, unknown>>);

  if (count !== undefined) {
    // eslint-disable-next-line @eslint-react/no-children-count -- count follows React's children traversal semantics
    assertCount(count, Children.count(result));
  }

  return result;
}

/**
 * Returns exactly one valid React element from children.
 *
 * @see https://foxact.skk.moe/get-single-react-children
 */
export function getSingleReactChildren(children: React.ReactNode) {
  return getReactChildren(children, 1)[0];
}
