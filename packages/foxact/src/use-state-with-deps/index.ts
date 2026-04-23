import { useState, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { useLayoutEffect } from '../use-isomorphic-layout-effect';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- must be any for typescript to proper infer the type of S
export function useStateWithDeps<S extends Record<string, any> = Record<string, any>>(initialState: S): [
  stateRef: RefObject<S>,
  stateDependenciesRef: RefObject<Partial<Record<keyof S, boolean>>>,
  setState: (payload: Partial<S>) => void
] {
  // eslint-disable-next-line @eslint-react/use-state -- just trigger re-render
  const [, rerender] = useState<Record<string, unknown>>({});

  const unmountedRef = useRef(false);
  const stateRef = useRef<S>(initialState);

  // If a state property is accessed by the render function
  // we mark the property as a dependency so if it is updated again
  // in the future, we trigger a rerender.
  //
  // This is also known as dependency-tracking.
  const stateDependenciesRef = useRef<Partial<Record<keyof S, boolean>>>({});

  /**
   * Updates state and triggers re-render if necessary.
   * @param payload To change stateRef, pass the values explicitly to setState:
   *
   * @example
   * ```js
   * setState({
   *   isValidating: false
   *   data: newData // set data to newData
   *   error: undefined // set error to undefined
   * })
   *
   * setState({
   *   data: undefined // set data to undefined
   *   error: err // set error to err
   * })
   * ```
   */
  const setState = useCallback((payload: Partial<S>) => {
    let shouldRerender = false;

    const currentState = stateRef.current;

    for (const key in payload) {
      // eslint-disable-next-line prefer-object-has-own -- compatibility with older browsers
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const k = key as keyof S;

        // If the property has changed, update the state and mark rerender as needed.
        if (currentState[k] !== payload[k]) {
          currentState[k] = payload[k]!;

          // If the property is accessed by the component, a rerender should be
          // triggered.
          if (stateDependenciesRef.current[k]) {
            shouldRerender = true;
          }
        }
      }
    }

    if (shouldRerender && !unmountedRef.current) {
      rerender({});
    }
  }, []);

  useLayoutEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  });

  return [stateRef, stateDependenciesRef, setState];
}
