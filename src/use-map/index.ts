import 'client-only';
import { useCallback, useState } from 'react';

export const useMap = <K, T>() => {
  const [map, setMap] = useState(() => new Map<K, T>());

  const add = useCallback((k: K, v: T) => setMap((prevMap) => {
    prevMap.set(k, v);
    return new Map(prevMap);
  }), []);

  const remove = useCallback((k: K) => setMap((prevMap) => {
    if (!prevMap.has(k)) {
      return prevMap;
    }
    prevMap.delete(k);
    return new Map(prevMap);
  }), []);

  const reset = useCallback(() => setMap(new Map()), []);

  return [map, add, remove, reset] as const;
};
