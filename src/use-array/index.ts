import 'client-only';
import { useCallback, useState } from 'react';

export const useArray = <T>(initialState: T[] | (() => T[]) = () => []) => {
  const [array, setArray] = useState<T[]>(initialState);

  const add = useCallback((v: T) => setArray((prevArray) => prevArray.concat(v)), []);
  const reset = useCallback(() => setArray([]), []);

  const removeByIndex = useCallback((index: number) => setArray((prevArray) => {
    if (index > -1) {
      const copy = prevArray.slice();
      copy.splice(index, 1);
      return copy;
    }
    return prevArray;
  }), []);

  return [array, add, reset, removeByIndex] as const;
};
