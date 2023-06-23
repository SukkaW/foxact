import 'client-only';
import { useCallback, useRef } from 'react';

export type UseCompositionInputCallback = (value: string) => void;
export type UseCompositionInputReturnKey = 'onChange' | 'onCompositionStart' | 'onCompositionEnd';
export type UseCompositionInputReturn = Pick<JSX.IntrinsicElements['input'], UseCompositionInputReturnKey>;

/** @see https://foxact.skk.moe/use-composition-input */
export const useCompositionInput = (cb: UseCompositionInputCallback): UseCompositionInputReturn => {
  // @ts-expect-error -- We are using singleton approach here, to prevent repeated initialization.
  const internalState: React.MutableRefObject<{
    /** is"C"ompositioning */ c: boolean,
    /** is"E"mitted */ e: boolean
  }> = useRef();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- it will be undefined only on first render
  if (!internalState.current) {
    internalState.current = {
      /** is"C"ompositioning */ c: false,
      /** is"E"mitted */ e: false
    };
  }

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.CompositionEvent<HTMLInputElement>) => {
    if ('value' in e.target) {
      const userInputValue = e.target.value;

      if (!internalState.current.c) {
        cb(userInputValue);
        internalState.current.e = true;
      } else {
        internalState.current.e = false;
      }
    }
  }, [cb]);

  const onCompositionStart = useCallback<React.CompositionEventHandler<HTMLInputElement>>(() => {
    internalState.current.c = true;
    internalState.current.e = false;
  }, []);

  const onCompositionEnd = useCallback<React.CompositionEventHandler<HTMLInputElement>>((e) => {
    internalState.current.c = false;
    // fixed for Chrome v53+ and detect all Chrome
    // https://chromium.googlesource.com/chromium/src/+/afce9d93e76f2ff81baaa088a4ea25f67d1a76b3%5E%21/
    // also fixed for the native Apple keyboard which emit input event before composition event
    // subscribe this issue: https://github.com/facebook/react/issues/8683
    if (!internalState.current.e) {
      onChange(e);
    }
  }, [onChange]);

  return {
    onChange,
    onCompositionStart,
    onCompositionEnd
  };
};
