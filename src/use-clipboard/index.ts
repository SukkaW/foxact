import 'client-only';

import { useState, useRef, useCallback } from 'react';

export class UseClipboardError extends Error { }

interface UseClipboardOption {
  timeout?: number,
  usePromptAsFallback?: boolean,
  promptFallbackText?: string
}

export function useClipboard({
  timeout = 1000,
  usePromptAsFallback = false,
  promptFallbackText = 'Failed to copy to clipboard automatically, please manually copy the text below.'
}: UseClipboardOption = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const handleCopyResult = useCallback((isCopied: boolean) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    if (isCopied) {
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    }
    setCopied(isCopied);
  }, [timeout]);

  const copy = useCallback(async (valueToCopy: string) => {
    try {
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(valueToCopy);
        handleCopyResult(true);
      } else {
        throw new UseClipboardError('[foxact] useClipboard: navigator.clipboard is not supported');
      }
    } catch (e) {
      if (usePromptAsFallback) {
        try {
          // eslint-disable-next-line no-alert -- prompt as fallback in case of copy error
          window.prompt(promptFallbackText, valueToCopy);
        } catch (e2) {
          setError(e2 as Error);
        }
      } else {
        setError(e as Error);
      }
    }
  }, [handleCopyResult]);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  return { copy, reset, error, copied };
}
