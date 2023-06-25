import 'client-only';
import { useCallback, useRef, useState } from 'react';
import { useStableHandler } from '../use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired';

const identity = <V>(value: V) => value;

/** @see https://foxact.skk.moe/use-uncontrolled */
export function useUncontrolled<T, E extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement>(initialValue: T, transformValue: (value: T) => T = identity) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(initialValue);
  const elementRef = useRef<E>(null);
  const stableTransformValue = useStableHandler(transformValue);

  const onCommitState = useCallback(() => {
    if (elementRef.current) {
      setUncontrolledValue(stableTransformValue(elementRef.current.value as T));
    }
  }, [stableTransformValue]);

  return [uncontrolledValue, onCommitState, elementRef] as const;
}
