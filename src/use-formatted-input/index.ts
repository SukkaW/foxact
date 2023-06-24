import 'client-only';
import {useState, useRef, useMemo, ChangeEvent, KeyboardEvent} from 'react';

export type UseFormattedInputReturnKey = 'ref' | 'value' | 'onChange' | 'onKeyDown';
export type UseFormattedInputReturn = Pick<JSX.IntrinsicElements['input'], UseFormattedInputReturnKey>;

export function useFormattedInput(delimiter = ',', interval = 3): UseFormattedInputReturn {
  const [rawValue, setRawValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const formattedValue = useMemo(() => {
    const numericInput = rawValue.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < numericInput.length; i++) {
      if (i > 0 && i % interval === 0) {
        formatted += delimiter;
      }
      formatted += numericInput[i];
    }
    return formatted;
  }, [rawValue, delimiter, interval]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {selectionStart} = e.target;
    const newValue = e.target.value;
    setRawValue(newValue);

    setTimeout(() => {
      if (ref.current && selectionStart !== null) {
        let newCursorPos = selectionStart;
        const oldFormattedValue = e.target.value;

        const nextChar = oldFormattedValue[selectionStart];
        const addedDelimiter = nextChar === delimiter || (selectionStart > 0 && oldFormattedValue[selectionStart - 1] === delimiter);

        if (addedDelimiter) {
          newCursorPos++;
        }

        ref.current.selectionStart = newCursorPos;
        ref.current.selectionEnd = newCursorPos;
      }
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && e.currentTarget.selectionStart !== null && e.currentTarget.selectionStart > 0) {
      if (e.currentTarget.value[e.currentTarget.selectionStart - 1] === delimiter) {
        e.preventDefault();
        if (e.currentTarget.selectionStart !== null) {
          e.currentTarget.selectionStart--;
          e.currentTarget.selectionEnd = e.currentTarget.selectionStart;
        }
      }
    }
  };

  return {
    ref,
    value: formattedValue,
    onChange,
    onKeyDown
  }
}

