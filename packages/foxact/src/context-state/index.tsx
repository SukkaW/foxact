import 'client-only';
// useState is React Client Component only

import { createContext, useContext, useState } from 'react';
import { noop } from '../noop';
import type { Foxact } from '../types';

/** @see https://foxact.skk.moe/context-state */
export function createContextState<T, Props = object>(initialState: T | ((props: Props) => T)): [
  Provider: React.ComponentType<Foxact.PropsWithChildren<Props>>,
  useValue: () => T,
  useSetValue: () => React.Dispatch<React.SetStateAction<T>>,
  StateContext: React.Context<T>
] {
  const StateContext = createContext<T | null>(typeof initialState === 'function' ? null : initialState);
  const DispatchContext = createContext<React.Dispatch<React.SetStateAction<T>>>(noop);

  const useValue = () => useContext(StateContext) as T;
  const useSetValue = () => useContext(DispatchContext);

  const Provider = ({ children, ...props }: Foxact.PropsWithChildren<Props>) => {
    const [value, setValue] = useState(() => (typeof initialState === 'function' ? (initialState as ((props: Props) => T))(props as Props) : initialState));

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
    StateContext as React.Context<T>
  ] as const;
}
