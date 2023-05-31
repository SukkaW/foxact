import 'client-only';
// useState is React Client Component only

import { createContext, useContext, useState } from 'react';
import { noop } from '@/noop';

export function createContextState<T>(initialState: T) {
  const StateContext = createContext<T>(initialState);
  const DispatchContext = createContext<React.Dispatch<React.SetStateAction<T>>>(noop);

  const useValue = () => useContext(StateContext);
  const useSetValue = () => useContext(DispatchContext);

  const Provider = ({ children }: React.PropsWithChildren) => {
    const [value, setValue] = useState(initialState);

    return (
      <StateContext.Provider value={value}>
        <DispatchContext.Provider value={setValue}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return [Provider, useValue, useSetValue] as const;
}
