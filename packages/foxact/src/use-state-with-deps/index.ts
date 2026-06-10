import { useState, useRef, useCallback } from 'react';
import { useLayoutEffect } from '../use-isomorphic-layout-effect';
import { useSingleton } from '../use-singleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- must be any for typescript to proper infer the type of S
export function useStateWithDeps<S extends Record<string, any> = Record<string, any>>(initialState: S): [
  state: Readonly<S>,
  setState: (payload: Partial<S>) => void
] {
  // eslint-disable-next-line @eslint-react/use-state -- just trigger re-render
  const [, rerender] = useState<Record<string, unknown>>({});

  const unmountedRef = useRef(false);
  const stateRef = useRef<S>(initialState);

  // Tracks which state properties are accessed by the render function, so
  // that only changes to those properties trigger a rerender.
  const stateDependenciesRef = useRef<Partial<Record<keyof S, boolean>>>({});

  const defineTrackedGetter = useCallback((target: S, key: keyof S) => {
    Object.defineProperty(target, key, {
      get() {
        stateDependenciesRef.current[key] = true;
        return stateRef.current[key];
      },
      enumerable: true
    });
  }, []);

  // A stable object with a tracked getter for every known state property.
  // Reading a property through it both returns the latest value from
  // stateRef and marks the property as a rendering dependency.
  const trackedStateRef = useSingleton<S>(() => {
    const tracked = {} as S;
    for (const key in initialState) {
      // eslint-disable-next-line prefer-object-has-own -- compatibility with older browsers
      if (Object.prototype.hasOwnProperty.call(initialState, key)) {
        defineTrackedGetter(tracked, key);
      }
    }
    return tracked;
  });

  /**
   * Updates state and triggers re-render if necessary.
   * @param payload To change the state, pass the values explicitly to setState:
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

        // A field we have never seen before (not part of initialState),
        // attach a tracked getter for it so future reads are tracked too.
        // eslint-disable-next-line prefer-object-has-own -- compatibility with older browsers
        if (!Object.prototype.hasOwnProperty.call(trackedStateRef.current, k)) {
          defineTrackedGetter(trackedStateRef.current, k);
        }

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
  }, [defineTrackedGetter, trackedStateRef]);

  useLayoutEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  });

  // eslint-disable-next-line react-hooks/refs -- update is tracked via rerender()
  return [trackedStateRef.current, setState];
}
