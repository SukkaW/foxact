import { useState, useCallback, useDebugValue as condUseDebugValue } from 'react';
import { useLayoutEffect } from '../use-isomorphic-layout-effect';

interface InternalRef<S> {
  /** state: the actual current state values */
  s: S,
  /**
   * dep: tracks which state properties are accessed by the render function, so
   * that only changes to those properties trigger a rerender.
   */
  d: Partial<Record<keyof S, boolean>>,
  /**
   * tracked snapshot: A stable object with a tracked getter for every known state property.
   * Reading a property through it both returns the latest value from
   * `state` and marks the property as a rendering dependency.
   */
  t: S,
  /** unmounted: whether the component has been unmounted */
  u: boolean
}

function defineTrackedGetter<S>(inst: InternalRef<S>, key: keyof S) {
  Object.defineProperty(inst.t, key, {
    get() {
      inst.d[key] = true;
      return inst.s[key];
    },
    enumerable: true
  });
}

// Only invoked by React DevTools when the hook is actually inspected, never
// during normal renders, and useDebugValue never causes a re-render.
function formatDebugValue<S>(inst: InternalRef<S>) {
  return {
    state: inst.s,
    tracked: inst.d
  };
}

// eslint-disable-next-line @typescript-eslint/unbound-method -- method alias, will call with .call
const ObjectPrototypeHasOwnProperty = Object.prototype.hasOwnProperty;

/** @see https://foxact.skk.moe/use-state-with-deps */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- must be any for typescript to proper infer the type of S
export function useStateWithDeps<S extends Record<string, any> = Record<string, any>>(initialState: S): [
  snapshot: Readonly<S>,
  setState: (payload: Partial<S> | ((prevState: Readonly<S>) => Partial<S>)) => void
] {
  // Because "updates" are synchronous, there will be no race conditions here, i.e.
  // there will be no mutating internal state during "updates". The only possible
  // mutation is from "setState" calls which would not happen during "updates".
  //
  // Hence, we force a re-render whenever the subscribed state changes by updating
  // an arbitrary useState hook, and just simply read the mutable value during render phase
  //
  // This is the only reason we can read and return the mutable value during render phase.
  //
  // Since we don't actually use the state returned by the useState hook, we can save
  // a bit of memory by storing other stuff in that slot.
  //
  // To force a re-render, we call rerender({inst}). That works because the
  // new object always fails an equality check.
  //
  // eslint-disable-next-line @eslint-react/use-state -- the slot stores the mutable instance and doubles as the rerender trigger
  const [{ inst }, rerender] = useState(() => {
    const instance: InternalRef<S> = {
      s: initialState,
      d: {},
      t: {} as S,
      u: false
    };
    for (const key in initialState) {
      if (ObjectPrototypeHasOwnProperty.call(initialState, key)) {
        defineTrackedGetter(instance, key);
      }
    }
    return { inst: instance };
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
   *
   * An updater function is also supported. It receives the current state and
   * returns a partial payload. Unlike reading from the snapshot returned by
   * the hook, reading from `prevState` does NOT mark properties as rendering
   * dependencies, so deriving the next value here won't cause future
   * re-renders for properties the render function never accesses.
   * Do not mutate `prevState` directly, always return a payload instead.
   *
   * @example
   * ```js
   * setState(prevState => ({ count: prevState.count + 1 }))
   * ```
   */
  const setState = useCallback((payloadOrFn: Partial<S> | ((prevState: Readonly<S>) => Partial<S>)) => {
    // Resolve the updater against the raw, untracked state (inst.s), so reads
    // inside the updater never fire tracked getters and never record render
    // dependencies.
    const payload = typeof payloadOrFn === 'function' ? payloadOrFn(inst.s) : payloadOrFn;

    let shouldRerender = false;

    for (const key in payload) {
      if (ObjectPrototypeHasOwnProperty.call(payload, key)) {
        const k = key as keyof S;

        // A field we have never seen before (not part of initialState),
        // attach a tracked getter for it so future reads are tracked too.
        if (!ObjectPrototypeHasOwnProperty.call(inst.t, k)) {
          defineTrackedGetter(inst, k);
        }

        // If the property has changed, update the state and mark rerender as needed.
        if (!Object.is(inst.s[k], payload[k])) {
          // inst is deliberately mutable, rerender is triggered manually below
          // eslint-disable-next-line react-hooks/immutability -- you think of `inst` as a ref
          inst.s[k] = payload[k]!;

          // If the property is accessed by the component, a rerender should be
          // triggered.
          if (inst.d[k]) {
            shouldRerender = true;
          }
        }
      }
    }

    if (shouldRerender && !inst.u) {
      rerender({ inst });
    }
  }, [inst]);

  // TODO: remove this once we drop support for React < 18
  // The only reason this exists to prevent prioir React 18 warnings
  // about "leaking state updates", but in reality there is no
  // behavioral difference.
  useLayoutEffect(() => {
    // `inst` is deliberately mutable, flag is only read inside setState
    // eslint-disable-next-line react-hooks/immutability -- you can think of `inst` as a ref
    inst.u = false;
    return () => {
      inst.u = true;
    };
  });

  if (process.env.NODE_ENV !== 'production') {
    condUseDebugValue(inst, formatDebugValue);
  }

  return [inst.t, setState];
}
