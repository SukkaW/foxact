import 'client-only';
import { useCallback } from 'react';
import { useSingleton } from '../use-singleton';

export type UseCompositionInputCallback = (value: string) => void;
export type UseCompositionInputReturnKey = 'onChange' | 'onCompositionStart' | 'onCompositionEnd';
export type UseCompositionInputReturn = Pick<JSX.IntrinsicElements['input'], UseCompositionInputReturnKey>;

const getInitialRef = () => ({
  /** is"C"ompositioning */ c: false,
  /** is"E"mitted */ e: false
});

/** @see https://foxact.skk.moe/use-composition-input */
export const useCompositionInput = (cb: UseCompositionInputCallback): UseCompositionInputReturn => {
  const internalState = useSingleton(getInitialRef);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.CompositionEvent<HTMLInputElement>) => {
    if ('value' in e.target) {
      const userInputValue = e.target.value;

      if (!internalState.current.c) {
        cb(userInputValue);
        // eslint-disable-next-line react-compiler/react-compiler -- internalState is ref
        internalState.current.e = true;
      } else {
        internalState.current.e = false;
      }
    }
  }, [cb, internalState]);

  const onCompositionStart = useCallback<React.CompositionEventHandler<HTMLInputElement>>(() => {
    internalState.current.c = true;
    internalState.current.e = false;
  }, [internalState]);

  const onCompositionEnd = useCallback<React.CompositionEventHandler<HTMLInputElement>>((e) => {
    internalState.current.c = false;
    // fixed for Chrome v53+ and detect all Chrome
    // https://chromium.googlesource.com/chromium/src/+/afce9d93e76f2ff81baaa088a4ea25f67d1a76b3%5E%21/
    // also fixed for the native Apple keyboard which emit input event before composition event
    // subscribe this issue: https://github.com/facebook/react/issues/8683
    if (!internalState.current.e) {
      onChange(e);
    }
  }, [internalState, onChange]);

  return {
    onChange,
    onCompositionStart,
    onCompositionEnd
  };
};
