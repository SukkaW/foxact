import 'client-only';
import { useCallback, useState } from 'react';

export function useArray<T>(initialState: T[] | (() => T[]) = () => []) {
  const [array, setArray] = useState<T[]>(initialState);

  const add = useCallback((v: T) => setArray((prevArray) => prevArray.concat(v)), []);
  const reset = useCallback(() => setArray([]), []);

  const removeByIndex = useCallback((index: number) => setArray((prevArray) => {
    // Only copy + splice when the index actually points to an existing element.
    // For an out-of-range index (negative, or >= length) we return the same
    // array instance so React bails out of the state update without re-rendering.
    if (index > -1 && index < prevArray.length) {
      const copy = prevArray.slice();
      copy.splice(index, 1);
      return copy;
    }
    return prevArray;
  }), []);

  return [array, add, reset, removeByIndex] as const;
}
