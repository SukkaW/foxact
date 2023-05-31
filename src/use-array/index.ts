import 'client-only';
import { useCallback, useState } from 'react';

export const useArray = <T>(initialState: T[] | (() => T[]) = () => []) => {
  const [array, setArray] = useState<T[]>(initialState);

  const add = useCallback((v: T) => setArray((prevArray) => prevArray.concat(v)), []);
  const reset = useCallback(() => setArray([]), []);

  return [array, add, reset] as const;
};
