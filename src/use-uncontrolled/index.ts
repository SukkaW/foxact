import 'client-only';
import { useReducer, useRef } from 'react';
import { useCallback } from '../use-typescript-happy-callback';

const identity = <V>(value: V) => value;

/** @see https://foxact.skk.moe/use-uncontrolled */
export function useUncontrolled<T, E extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement>(initialValue: T, transformValue: (value: T) => T = identity) {
  const elementRef = useRef<E>(null);

  // The dispatch is always memoized while reducer can always access the latest `transformValue` from prop
  // https://overreacted.io/a-complete-guide-to-useeffect/#why-usereducer-is-the-cheat-mode-of-hooks

  // Although the `transformValue` is most likely not stable, still wraps it with `useCallback` in case the
  // user does memoize it and we are able to opt-in useReducer's internal optimization.
  //
  // **UPDATE**
  // React removes the eager reducer bailout since React 18, so memoize the reducer is no longer necessary.
  // https://github.com/facebook/react/pull/22445
  const reducer = (_prevState: T, valueAsAction: T) => {
    return transformValue(valueAsAction);
  };

  const [uncontrolledValue, setUncontrolledValue] = useReducer(reducer, initialValue);

  const onCommitState = useCallback(() => {
    if (elementRef.current) {
      setUncontrolledValue(elementRef.current.value as T);
    }
  }, []);

  return [uncontrolledValue, onCommitState, elementRef] as const;
}
