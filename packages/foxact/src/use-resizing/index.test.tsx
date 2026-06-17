import { after, before, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, render, screen } from '@testing-library/react';
import { useResizing } from '.';
import type { UseResizingOptions } from '.';

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
  public static readonly instances: MockResizeObserver[] = [];

  public observed = new Set<Element>();
  public disconnected = false;

  constructor(
    private readonly callback: ResizeCallback
  ) {
    MockResizeObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.add(el);
    this.callback([{ target: el } as ResizeObserverEntry]);
  }

  unobserve(el: Element) {
    this.observed.delete(el);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  trigger(el: Element) {
    act(() => this.callback([{ target: el } as ResizeObserverEntry]));
  }
}

const realResizeObserver = globalThis.ResizeObserver;

interface Captured {
  isResizing: boolean
}

function mount(opts?: UseResizingOptions) {
  const captured: Captured = { isResizing: false };

  function Probe() {
    const [isResizing, refCallback] = useResizing(opts);
    captured.isResizing = isResizing;
    return <div ref={refCallback} data-testid="resize-probe" />;
  }

  const view = render(<Probe />);
  const element = screen.getByTestId('resize-probe');
  const observer = MockResizeObserver.instances.at(-1)!;

  return { captured, view, element, observer };
}

describe('useResizing', () => {
  let clock: { tick: (ms: number) => void, restore: () => void };

  before(() => {
    (globalThis as Record<string, unknown>).ResizeObserver = MockResizeObserver;
  });

  after(() => {
    (globalThis as Record<string, unknown>).ResizeObserver = realResizeObserver;
  });

  function initFakeTimers() {
    const origSetTimeout = globalThis.setTimeout;
    const origClearTimeout = globalThis.clearTimeout;
    let pending: Array<{ fn: () => void, at: number, id: number }> = [];
    let now = 0;
    let nextId = 1;

    (globalThis as Record<string, unknown>).setTimeout = (fn: () => void, delay: number) => {
      const id = nextId++;
      pending.push({ fn, at: now + delay, id });
      return id;
    };
    (globalThis as Record<string, unknown>).clearTimeout = (id: number) => {
      pending = pending.filter((t) => t.id !== id);
    };

    clock = {
      tick(ms: number) {
        now += ms;
        const ready = pending.filter((t) => t.at <= now);
        pending = pending.filter((t) => t.at > now);
        ready.forEach((t) => act(() => t.fn()));
      },
      restore() {
        globalThis.setTimeout = origSetTimeout;
        globalThis.clearTimeout = origClearTimeout;
        pending = [];
        now = 0;
      }
    };
  }

  it('starts as not resizing (leading=false, default)', () => {
    const { captured } = mount();
    expect(captured.isResizing).toEqual(false);
  });

  it('starts as resizing when leading=true', () => {
    initFakeTimers();
    try {
      const { captured } = mount({ leading: true });
      expect(captured.isResizing).toEqual(true);
    } finally {
      clock.restore();
    }
  });

  it('sets isResizing=true on resize and resets after timeout', () => {
    initFakeTimers();
    try {
      const { captured, element, observer } = mount({ timeout: 100 });
      expect(captured.isResizing).toEqual(false);

      observer.trigger(element);
      expect(captured.isResizing).toEqual(true);

      clock.tick(99);
      expect(captured.isResizing).toEqual(true);

      clock.tick(1);
      expect(captured.isResizing).toEqual(false);
    } finally {
      clock.restore();
    }
  });

  it('debounces: resets the timer on each resize', () => {
    initFakeTimers();
    try {
      const { captured, element, observer } = mount({ timeout: 100 });

      observer.trigger(element);
      expect(captured.isResizing).toEqual(true);

      clock.tick(80);
      expect(captured.isResizing).toEqual(true);

      observer.trigger(element);
      expect(captured.isResizing).toEqual(true);

      clock.tick(80);
      expect(captured.isResizing).toEqual(true);

      clock.tick(20);
      expect(captured.isResizing).toEqual(false);
    } finally {
      clock.restore();
    }
  });

  it('skips the initial observe callback when leading=false', () => {
    initFakeTimers();
    try {
      const { captured } = mount({ leading: false });
      expect(captured.isResizing).toEqual(false);
    } finally {
      clock.restore();
    }
  });

  it('fires on the initial observe callback when leading=true', () => {
    initFakeTimers();
    try {
      const { captured } = mount({ leading: true, timeout: 100 });
      expect(captured.isResizing).toEqual(true);

      clock.tick(100);
      expect(captured.isResizing).toEqual(false);
    } finally {
      clock.restore();
    }
  });

  it('observes the element', () => {
    const { element, observer } = mount();
    expect(observer.observed.has(element)).toEqual(true);
  });

  it('disconnects on unmount and clears pending timer', () => {
    initFakeTimers();
    try {
      const { element, observer, view } = mount({ timeout: 100 });

      observer.trigger(element);

      view.unmount();
      expect(observer.disconnected).toEqual(true);
    } finally {
      clock.restore();
    }
  });

  it('disconnects the old observer when ref changes to a new element', () => {
    const { observer: firstObserver, view } = mount();

    const secondElement = document.createElement('span');
    function Probe2() {
      const [, refCallback] = useResizing();
      return <span ref={(el) => { refCallback(el ?? secondElement); }} />;
    }
    view.rerender(<Probe2 />);

    expect(firstObserver.disconnected).toEqual(true);
    const secondObserver = MockResizeObserver.instances.at(-1)!;
    expect(secondObserver).not.toExactlyEqual(firstObserver);
  });

  it('disconnects when ref is set to null', () => {
    const { observer, view } = mount();

    function NoElement() {
      const [, refCallback] = useResizing();
      return <div ref={() => refCallback(null)} />;
    }
    view.rerender(<NoElement />);

    expect(observer.disconnected).toEqual(true);
  });

  it('uses default timeout of 150ms', () => {
    initFakeTimers();
    try {
      const { captured, element, observer } = mount();

      observer.trigger(element);
      expect(captured.isResizing).toEqual(true);

      clock.tick(149);
      expect(captured.isResizing).toEqual(true);

      clock.tick(1);
      expect(captured.isResizing).toEqual(false);
    } finally {
      clock.restore();
    }
  });
});
