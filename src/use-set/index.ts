import 'client-only';
import { useCallback, useState } from 'react';

export const useSet = <T>() => {
  const [set, setSet] = useState(() => new Set<T>());

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

  return [set, add, remove, reset] as const;
};
