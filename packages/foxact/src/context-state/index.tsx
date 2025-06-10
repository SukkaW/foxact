import 'client-only';
// useState is React Client Component only

import { createContext, useContext, useState } from 'react';
import { noop } from '../noop';
import type { Foxact } from '../types';

export interface ProviderProps<T> {
  initialState?: T | (() => T)
}

/** @see https://foxact.skk.moe/context-state */
// Option 1: Use `createContextState<T>(initialState: T)`
export function createContextState<T>(initialState: T): [
  Provider: React.ComponentType<Foxact.PropsWithChildren>,
  useValue: () => T,
  useSetValue: () => React.Dispatch<React.SetStateAction<T>>,
  StateContext: React.Context<T>
];
// Option 2: Use `createContextState<T>(initialState: T)`, call initialState in `<Provider>` is optional
export function createContextState<T>(initialState: T): [
  Provider: React.ComponentType<Foxact.PropsWithChildren<ProviderProps<T>>>,
  useValue: () => T,
  useSetValue: () => React.Dispatch<React.SetStateAction<T>>,
  StateContext: React.Context<T>
];
// Option 3: Use `createContextState<T>()`, call `<Provider initialState={...}>`
export function createContextState<T>(): [
  Provider: React.ComponentType<Foxact.PropsWithChildren<Required<ProviderProps<T>>>>,
  useValue: () => T,
  useSetValue: () => React.Dispatch<React.SetStateAction<T>>,
  StateContext: React.Context<T>
];
export function createContextState(initialState?: unknown): unknown {
  const StateContext = createContext(initialState);
  const DispatchContext = createContext(noop);

  const useValue = () => useContext(StateContext);
  const useSetValue = () => useContext(DispatchContext);

  const Provider = ({ children, initialState: initialStateFromProps }: Foxact.PropsWithChildren<ProviderProps<unknown>>) => {
    const [value, setValue] = useState((initialStateFromProps ?? initialState));

    return (
      <StateContext.Provider value={value}>
        <DispatchContext.Provider value={setValue}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return [
    Provider,
    useValue,
    useSetValue,
    /** Exports the context that holds the value, which allows you to use `React.use(Context)` */
    StateContext
  ] as const;
}
