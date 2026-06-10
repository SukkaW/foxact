import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';
import sinon from 'sinon';

import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { useClipboard, UseClipboardError } from '.';

describe('useClipboard', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('copies via navigator.clipboard and sets copied', async () => {
    const writeText = sinon.stub(navigator.clipboard, 'writeText').resolves();

    const { result } = renderHook(() => useClipboard());

    await act(() => result.current.copy('foxact'));

    expect(writeText.calledOnceWithExactly('foxact')).toEqual(true);
    expect(result.current.copied).toEqual(true);
    expect(result.current.error).toEqual(null);
  });

  it('resets copied after the timeout', async () => {
    sinon.stub(navigator.clipboard, 'writeText').resolves();

    const { result } = renderHook(() => useClipboard({ timeout: 50 }));

    await act(() => result.current.copy('foxact'));
    expect(result.current.copied).toEqual(true);

    await waitFor(() => {
      expect(result.current.copied).toEqual(false);
    });
  });

  it('resets the state via reset()', async () => {
    sinon.stub(navigator.clipboard, 'writeText').resolves();

    const { result } = renderHook(() => useClipboard());

    await act(() => result.current.copy('foxact'));
    expect(result.current.copied).toEqual(true);

    act(() => result.current.reset());

    expect(result.current.copied).toEqual(false);
    expect(result.current.error).toEqual(null);
  });

  it('reports an error when every enabled method fails', async () => {
    sinon.stub(navigator.clipboard, 'writeText').rejects(new Error('denied'));
    const onCopyError = sinon.spy();

    const { result } = renderHook(() => useClipboard({
      useExecCommandAsFallback: false,
      onCopyError
    }));

    await act(() => result.current.copy('foxact'));

    expect(result.current.copied).toEqual(false);
    expect(result.current.error).toBeA(UseClipboardError);
    expect(onCopyError.calledOnceWithExactly(result.current.error!)).toEqual(true);
  });

  it('falls back to window.prompt when enabled, without setting an error', async () => {
    sinon.stub(navigator.clipboard, 'writeText').rejects(new Error('denied'));
    // Happy DOM has no window.prompt, sinon.define both creates and restores it
    const prompt = sinon.fake.returns(null);
    sinon.define(window, 'prompt', prompt);

    const { result } = renderHook(() => useClipboard({
      useExecCommandAsFallback: false,
      usePromptAsFallback: true,
      promptFallbackText: 'copy this manually'
    }));

    await act(() => result.current.copy('foxact'));

    expect(prompt.calledOnceWithExactly('copy this manually', 'foxact')).toEqual(true);
    // prompt fallback is not a successful copy, but not an error either
    expect(result.current.copied).toEqual(false);
    expect(result.current.error).toEqual(null);
  });

  describe('execCommand fallback', () => {
    it('copies via document.execCommand when navigator.clipboard fails', async () => {
      sinon.stub(navigator.clipboard, 'writeText').rejects(new Error('denied'));

      let selectionDuringExecCommand = '';
      const execCommand = sinon.fake((_commandId: string) => {
        // the text to copy is placed into a selected <span> at this point
        selectionDuringExecCommand = document.getSelection()!.toString();
        return true;
      });
      sinon.define(document, 'execCommand', execCommand);

      const { result } = renderHook(() => useClipboard());

      await act(() => result.current.copy('foxact'));

      expect(execCommand.calledOnceWithExactly('copy')).toEqual(true);
      expect(selectionDuringExecCommand).toEqual('foxact');
      expect(result.current.copied).toEqual(true);
      expect(result.current.error).toEqual(null);
      // the temporary <span> is cleaned up
      expect(screen.queryByText('foxact')).toEqual(null);
    });

    it('reports the navigator.clipboard error when execCommand also fails', async () => {
      sinon.stub(navigator.clipboard, 'writeText').rejects(new Error('denied'));
      sinon.define(document, 'execCommand', sinon.fake.returns(false));

      const { result } = renderHook(() => useClipboard());

      await act(() => result.current.copy('foxact'));

      expect(result.current.copied).toEqual(false);
      expect(result.current.error).toBeA(UseClipboardError);
    });
  });
});
