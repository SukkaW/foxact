import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderHook } from '@testing-library/react';
import { useAbortableEffect, useEffect } from '.';

describe('useAbortableEffect', () => {
  it('invokes the effect with a non-aborted AbortSignal', () => {
    let receivedSignal: AbortSignal | undefined;

    renderHook(() => useAbortableEffect((signal) => {
      receivedSignal = signal;
    }, []));

    expect(receivedSignal).toBeA(AbortSignal);
    expect(receivedSignal!.aborted).toEqual(false);
  });

  it('aborts the signal on unmount', () => {
    let receivedSignal: AbortSignal | undefined;

    const { unmount } = renderHook(() => useAbortableEffect((signal) => {
      receivedSignal = signal;
    }, []));

    unmount();

    expect(receivedSignal!.aborted).toEqual(true);
  });

  it('aborts the previous signal and provides a fresh one when deps change', () => {
    const signals: AbortSignal[] = [];

    const { rerender } = renderHook((dep: number) => useAbortableEffect((signal) => {
      signals.push(signal);
    }, [dep]), { initialProps: 1 });

    rerender(2);

    expect(signals.length).toEqual(2);
    expect(signals[0].aborted).toEqual(true);
    expect(signals[1].aborted).toEqual(false);
    expect(signals[1]).not.toExactlyEqual(signals[0]);
  });

  it('does not re-run the effect when deps are unchanged', () => {
    let effectCount = 0;

    const { rerender } = renderHook((dep: number) => useAbortableEffect(() => {
      effectCount++;
    }, [dep]), { initialProps: 1 });

    rerender(1);

    expect(effectCount).toEqual(1);
  });

  it('still runs the effect cleanup function, after aborting the signal', () => {
    const order: string[] = [];
    let receivedSignal: AbortSignal | undefined;

    const { unmount } = renderHook(() => useAbortableEffect((signal) => {
      receivedSignal = signal;
      return () => {
        order.push(`cleanup (signal aborted: ${receivedSignal!.aborted})`);
      };
    }, []));

    receivedSignal!.addEventListener('abort', () => { order.push('abort'); });

    unmount();

    // The signal is aborted first, then the user-provided cleanup runs
    expect(order).toEqual(['abort', 'cleanup (signal aborted: true)']);
  });

  it('supports the documented addEventListener({ signal }) usage', () => {
    let fired = 0;
    const target = new EventTarget();

    const { unmount } = renderHook(() => useAbortableEffect((signal) => {
      target.addEventListener('ping', () => {
        fired++;
      }, { signal });
    }, []));

    target.dispatchEvent(new Event('ping'));
    expect(fired).toEqual(1);

    // Unmount aborts the signal, which removes the listener
    unmount();

    target.dispatchEvent(new Event('ping'));
    expect(fired).toEqual(1);
  });

  it('exports useEffect as an alias of useAbortableEffect', () => {
    expect(useEffect).toExactlyEqual(useAbortableEffect);
  });
});
