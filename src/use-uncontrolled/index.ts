import 'client-only';
import { useCallback, useInsertionEffect, useRef, useState } from 'react';
import { noop } from '../noop';

const identity = <V>(value: V) => value;

export function useUncontrolled<T, E extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement = HTMLInputElement>(initialValue: T, transformValue: (value: T) => T = identity) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(initialValue);
  const elementRef = useRef<E>(null);

  const transformValueCallbackRef = useRef<(value: T) => T>(noop);
  useInsertionEffect(() => {
    transformValueCallbackRef.current = transformValue;
  }, [transformValue]);

  const onCommitState = useCallback(() => {
    if (elementRef.current) {
      setUncontrolledValue(transformValueCallbackRef.current(elementRef.current.value as T));
    }
  }, []);

  return [uncontrolledValue, onCommitState, elementRef] as const;
}
