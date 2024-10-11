import 'client-only';
import { useCallback, useState } from 'react';

export function useSet<T>(initialState: Set<T> | (() => Set<T>) = () => new Set<T>()) {
  const [set, setSet] = useState(initialState);

  const add = useCallback((item: T) => setSet((prevSet) => {
    if (prevSet.has(item)) {
      return prevSet;
    }
    return new Set([...prevSet, item]);
  }), []);

  const remove = useCallback((item: T) => setSet((prevSet) => {
    if (!prevSet.has(item)) {
      return prevSet;
    }
    prevSet.delete(item);
    return new Set(prevSet);
  }), []);

  const reset = useCallback(() => setSet(new Set()), []);
  const setAll = useCallback((s: Set<T>) => setSet(s), []);

  return [set, add, remove, reset, setAll] as const;
}
