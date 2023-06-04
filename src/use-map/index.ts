import 'client-only';
import { useCallback, useState } from 'react';

export const useMap = <K, T>(initialState: Map<K, T> | (() => Map<K, T>) = () => new Map<K, T>()) => {
  const [map, setMap] = useState<Map<K, T>>(initialState);

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
  const setAll = useCallback((m: Map<K, T>) => setMap(m), []);

  return [map, add, remove, reset, setAll] as const;
};
