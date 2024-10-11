import { useState } from 'react';

/**
  * @see {https://foxact.skk.moe/use-component-will-receive-update}
  */
export function useComponentWillReceiveUpdate(callback: () => void, deps: readonly unknown[]) {
  deps = [...deps];
  const [prev, setPrev] = useState(deps);
  let changed = deps.length !== prev.length;
  for (let i = 0; i < deps.length; i += 1) {
    if (changed) break;
    if (prev[i] !== deps[i]) changed = true;
  }
  if (changed) {
    setPrev(deps);
    callback();
  }
}
