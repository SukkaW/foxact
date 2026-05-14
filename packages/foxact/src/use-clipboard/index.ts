import 'client-only';

import { useState, useRef } from 'react';
import { noop } from '../noop';
import { useStableHandler } from '../use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired';
import { useCallback } from '../use-typescript-happy-callback';

export class UseClipboardError extends Error {
  public readonly name = 'UseClipboardError';
}

interface UseClipboardOption {
  timeout?: number,
  /** @default true */
  useExecCommandAsFallback?: boolean,
  /** @default false */
  usePromptAsFallback?: boolean,
  promptFallbackText?: string,
  onCopyError?: (error: Error) => void
}

/** @see https://foxact.skk.moe/use-clipboard */
export function useClipboard({
  timeout = 1000,
  useExecCommandAsFallback = true,
  usePromptAsFallback = false,
  promptFallbackText = 'Failed to copy to clipboard, please manually copy the text below.',
  onCopyError
}: UseClipboardOption = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const stablizedOnCopyError = useStableHandler<[e: Error], void>(onCopyError || noop);

  const handleCopyResult = useCallback((isCopied: boolean) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    if (isCopied) {
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    }
    setCopied(isCopied);
  }, [timeout]);

  const handleCopyError = useCallback((e: Error) => {
    setError(e);
    stablizedOnCopyError(e);
  }, [stablizedOnCopyError]);

  const copy = useCallback(async (valueToCopy: string) => {
    try {
      const copyResult = await copyToClipboard(valueToCopy, useExecCommandAsFallback, usePromptAsFallback, promptFallbackText);
      if (typeof copyResult === 'boolean') {
        if (copyResult) {
          handleCopyResult(true);
        }
      } else {
        handleCopyError(copyResult);
      }
    } catch (e) {
      handleCopyError(e as Error);
    }
  }, [handleCopyResult, promptFallbackText, handleCopyError, useExecCommandAsFallback, usePromptAsFallback]);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  return { copy, reset, error, copied };
}

// Returns true if text was written to the clipboard, false if the prompt fallback was shown.
// Returns UseClipboardError if all chosen methods fail.
async function copyToClipboard(
  text: string,
  useExecCommandAsFallback: boolean,
  usePromptAsFallback: boolean,
  promptFallbackText: string
): Promise<boolean | UseClipboardError> {
  let clipboardError: UseClipboardError;

  // 1. Try navigator.clipboard (primary)
  if ('clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      clipboardError = new UseClipboardError('[foxact/use-clipboard] Failed to copy using navigator.clipboard');
      clipboardError.cause = e;
    }
  } else {
    clipboardError = new UseClipboardError('[foxact/use-clipboard] navigator.clipboard is not supported');
  }

  // 2. Try document.execCommand fallback
  if (useExecCommandAsFallback) {
    let success: boolean;

    const activeElement = document.activeElement;

    // Save current selection ranges to restore afterward
    const savedRanges: Range[] = [];

    // document.getSelection() only returns null in cross-origin iframes
    // our case will never trigger this case, safe to assert non-null
    const selection = document.getSelection()!;

    // Blur focused input/textarea so selection won't interfere
    // Later during cleanup we will try to restore focus
    let blurredElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Find the appropriate root: active modal dialog > fullscreen element > body
    let root: Element = document.fullscreenElement ?? document.body;
    let lookupEl: Element | null = activeElement;
    while (lookupEl) {
      if (lookupEl.tagName === 'DIALOG' && (lookupEl as HTMLDialogElement).open) {
        root = lookupEl;
        break;
      }
      lookupEl = lookupEl.parentElement;
    }

    // Put the text to copy into a <span />
    let span: HTMLSpanElement | null = null;

    try {
      if (selection.rangeCount) {
        for (let i = 0; i < selection.rangeCount; i++) {
          savedRanges.push(selection.getRangeAt(i));
        }
        selection.removeAllRanges();
      }

      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
        blurredElement = activeElement as HTMLInputElement | HTMLTextAreaElement;
        blurredElement.blur();
      }

      const range = document.createRange();

      span = document.createElement('span');
      span.textContent = text;
      // Preserve consecutive spaces and newlines
      span.style.whiteSpace = 'pre';
      // avoid screen readers from reading out loud the text
      span.ariaHidden = 'true';
      // reset user styles for span element
      span.style.all = 'unset';
      // prevents scrolling to the end of the page
      span.style.position = 'fixed';
      span.style.top = '0';
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- intentionally use clip to hide visually
      span.style.clip = 'rect(0, 0, 0, 0)';
      span.style.borderWidth = '0';
      span.style.overflow = 'hidden';
      // do not inherit user-select (it may be `none`)
      span.style.userSelect = 'text';
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Fuck Safari
      span.style.webkitUserSelect = 'text';
      (span.style as CSSStyleDeclaration & { MozUserSelect: string }).MozUserSelect = 'text';
      (span.style as CSSStyleDeclaration & { msUserSelect: string }).msUserSelect = 'text';
      span.addEventListener('copy', (evt) => {
        // prevent leaking copy event from self-created element
        evt.stopPropagation();
      });

      root.appendChild(span);
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);

      // eslint-disable-next-line @typescript-eslint/no-deprecated -- intentionally use this as a fallback
      success = document.execCommand('copy');
    } catch (e) {
      clipboardError = new UseClipboardError('[foxact/use-clipboard] Failed to copy using execCommand fallback');
      clipboardError.cause = e;
      success = false;
    } finally { // cleanup
      selection.removeAllRanges();
      if (span) {
        root.removeChild(span);
      }

      // Restore previous selection
      if (selection.type === 'Caret') {
        selection.removeAllRanges();
      }
      if (!selection.rangeCount) {
        savedRanges.forEach(r => selection.addRange(r));
      }

      // Restore focus
      blurredElement?.focus();
    }

    if (success) return true;
  }

  // 3. Try prompt fallback
  if (usePromptAsFallback) {
    // eslint-disable-next-line no-alert -- prompt as fallback in case of copy error
    window.prompt(promptFallbackText, text);
    return false;
  }

  // All enabled methods failed — return a descriptive error (no raise error here)
  return clipboardError;
}
