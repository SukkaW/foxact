import { version as reactVersion } from 'react';

function react18AndBelowMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    });
  };
}

function modernMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value) => {
    const react19RefCallbackCleanups = new Set<() => void>();
    const legacyRefCallbacks = new Set<React.RefCallback<T>>();

    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        const cleanup = ref(value);

        if (typeof cleanup === 'function') {
          react19RefCallbackCleanups.add(cleanup);
        } else {
          // Legacy React ref callback that expects T | null
          legacyRefCallbacks.add(ref);
        }
      } else if (ref) {
        ref.current = value;
      }
    });

    // Explict use React 19 return cleanup
    return () => {
      react19RefCallbackCleanups.forEach((cleanup) => cleanup());

      // There might be legacy ref callback that still expects T | null
      // We need to manually bridge that
      legacyRefCallbacks.forEach((ref) => ref(null));
    };
  };
}

export const mergeRefs = Number.parseFloat(reactVersion) <= 18 ? react18AndBelowMergeRefs : modernMergeRefs;
