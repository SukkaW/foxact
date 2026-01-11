import 'client-only';
// useReducer is React Client Component only

import { createContext, useContext, useReducer } from 'react';
import { noop } from '../noop';
import { identity } from 'foxts/identity';
import { isFunction } from 'foxts/is-function';

/**
 * @see https://foxact.skk.moe/context-reducer
 *
 * Option 1:
 *
 * ```ts
 * createContextReducer<S, A, I = S>(reducer, initialArg: I, init?: (arg: I) => S)
 * ```
 */
export function createContextReducer<S, A, I = S>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (arg: I) => S
): [
  Provider: React.ComponentType<React.PropsWithChildren>,
  useValue: () => S,
  useDispatch: () => React.Dispatch<A>,
  StateContext: React.Context<S>
];
/**
 * @see https://foxact.skk.moe/context-reducer
 *
 * Option 2:
 *
 * ```ts
 * createContextReducer<S, A, I = S>(reducer, initialArg?: I, init?: (arg: I) => S)
 * ```
 * Call `initialArg`/`init` in `<Provider>` is optional
 */
export function createContextReducer<S, A, I = S>(
  reducer: (state: S, action: A) => S,
  initialArg?: I,
  init?: (arg: I) => S
): [
  Provider: React.ComponentType<React.PropsWithChildren<{ initialArg?: I, init?: (arg: I) => S }>>,
  useValue: () => S,
  useDispatch: () => React.Dispatch<A>,
  StateContext: React.Context<S>
];
/**
 * @see https://foxact.skk.moe/context-reducer
 *
 * Option 3:
 *
 * ```ts
 * createContextReducer<S, A, I = S>(reducer)
 * ```
 * Provide `initialArg` and/or `init` via `<Provider initialArg={...} init={...}>`
 */
export function createContextReducer<S, A, I = S>(
  reducer: (state: S, action: A) => S
): [
  Provider: React.ComponentType<React.PropsWithChildren<Required<{ initialArg?: I, init?: (arg: I) => S }>>>,
  useValue: () => S,
  useDispatch: () => React.Dispatch<A>,
  StateContext: React.Context<S>
];
export function createContextReducer(reducer?: unknown, initialArg?: unknown, init?: unknown): unknown {
  let initialState: unknown;
  if (isFunction(init)) {
    initialState = init(initialArg);
  } else {
    initialState = initialArg;
  }

  const StateContext = createContext(initialState);
  const DispatchContext = createContext(noop);

  const useValue = () => useContext(StateContext);
  const useDispatch = () => useContext(DispatchContext);

  const Provider = ({ children, initialArg: initialArgFromProps, init: initFromProps }: React.PropsWithChildren<{ initialArg?: unknown, init?: (arg: unknown) => unknown }>) => {
    const finalArg = initialArgFromProps ?? initialArg;
    const finalInit = initFromProps ?? init ?? identity;

    const [value, dispatch] = useReducer(reducer as (state: unknown, action: unknown) => unknown, finalArg, finalInit as (arg: unknown) => unknown);

    return (
      <StateContext.Provider value={value}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return [
    Provider,
    useValue,
    useDispatch,
    /** Exports the context that holds the value, which allows you to use `React.use(Context)` */
    StateContext
  ] as const;
}
