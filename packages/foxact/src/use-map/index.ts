import 'client-only';
import { useCallback, useState } from 'react';

export function useMap<K, T>(initialState: Map<K, T> | (() => Map<K, T>) = () => new Map<K, T>()) {
  const [map, setMap] = useState<Map<K, T>>(initialState);

  const add = useCallback((k: K, v: T) => setMap((prevMap) => {
    // Copy first, then set, so the previous map is never mutated
    const copy = new Map(prevMap);
    copy.set(k, v);
    return copy;
  }), []);

  const remove = useCallback((k: K) => setMap((prevMap) => {
    if (!prevMap.has(k)) {
      return prevMap;
    }
    // Copy first, then delete, so the previous map is never mutated
    const copy = new Map(prevMap);
    copy.delete(k);
    return copy;
  }), []);

  const reset = useCallback(() => setMap(new Map()), []);
  const setAll = useCallback((m: Map<K, T>) => setMap(m), []);

  return [map, add, remove, reset, setAll] as const;
}
