import {useState, ChangeEvent, KeyboardEvent, useRef, useMemo} from 'react';

export function useInputFormatter(delimiter = ',', interval = 3) {
  const [rawValue, setRawValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {selectionStart} = e.target;
    const newValue = e.target.value;
    setRawValue(newValue);

    setTimeout(() => {
      if (inputRef.current && selectionStart !== null) {
        let newCursorPos = selectionStart;
        const oldFormattedValue = e.target.value;

        const nextChar = oldFormattedValue[selectionStart];
        const addedDelimiter = nextChar === delimiter || (selectionStart > 0 && oldFormattedValue[selectionStart - 1] === delimiter);

        if (addedDelimiter) {
          newCursorPos++;
        }

        inputRef.current.selectionStart = newCursorPos;
        inputRef.current.selectionEnd = newCursorPos;
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  return [formattedValue, handleChange, handleKeyDown, inputRef];
}

