import { after, before, describe, it } from 'mocha';
import { expect } from 'earl';

import { act, render, screen } from '@testing-library/react';
import { useIntersection } from '.';
import type { UseIntersectionArgs } from '.';

type Entry = Pick<IntersectionObserverEntry, 'target' | 'isIntersecting' | 'intersectionRatio'>;

/**
 * Happy DOM ships an IntersectionObserver, but it never fires based on real
 * layout. We swap in a controllable mock (the hook resolves the constructor
 * at runtime) and drive the entries by hand.
 */
class MockIntersectionObserver {
  public static readonly instances: MockIntersectionObserver[] = [];

  public observed = new Set<Element>();
  public disconnected = false;

  constructor(
    private readonly callback: (entries: Entry[]) => void,
    public options?: IntersectionObserverInit
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.add(el);
  }

  unobserve(el: Element) {
    this.observed.delete(el);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  trigger(entries: Entry[]) {
    act(() => this.callback(entries));
  }
}

const realIntersectionObserver = globalThis.IntersectionObserver;

interface Captured {
  visible: boolean,
  reset: () => void
}

let uniqueMarginCounter = 0;

// The hook caches IntersectionObserver instances per root + rootMargin at the
// module level, so give every test a unique rootMargin for an isolated observer.
function mount(extraArgs: Omit<UseIntersectionArgs, 'rootMargin'> = {}) {
  const captured: Captured = {
    visible: false,
    reset() { /* replaced by Probe */ }
  };
  const args: UseIntersectionArgs = { rootMargin: `${++uniqueMarginCounter}px`, ...extraArgs };

  function Probe() {
    const [setRef, visible, reset] = useIntersection<HTMLDivElement>(args);
    captured.visible = visible;
    captured.reset = reset;
    return <div ref={setRef} data-testid="intersection-probe" />;
  }

  const view = render(<Probe />);
  const element = screen.getByTestId('intersection-probe');
  const observer = MockIntersectionObserver.instances.at(-1);

  return { captured, view, element, observer };
}

describe('useIntersection', () => {
  before(() => {
    (globalThis as Record<string, unknown>).IntersectionObserver = MockIntersectionObserver;
  });
  after(() => {
    (globalThis as Record<string, unknown>).IntersectionObserver = realIntersectionObserver;
  });

  it('starts as not intersected and observes the element', () => {
    const { captured, element, observer } = mount();

    expect(captured.visible).toEqual(false);
    expect(observer!.observed.has(element)).toEqual(true);
  });

  it('becomes intersected when the element enters the viewport', () => {
    const { captured, element, observer } = mount();

    observer!.trigger([{ target: element, isIntersecting: true, intersectionRatio: 1 }]);

    expect(captured.visible).toEqual(true);
  });

  it('treats intersectionRatio > 0 as intersected even without isIntersecting', () => {
    const { captured, element, observer } = mount();

    observer!.trigger([{ target: element, isIntersecting: false, intersectionRatio: 0.5 }]);

    expect(captured.visible).toEqual(true);
  });

  it('is "hasIntersected": stays true after the element leaves the viewport', () => {
    const { captured, element, observer } = mount();

    observer!.trigger([{ target: element, isIntersecting: true, intersectionRatio: 1 }]);
    expect(captured.visible).toEqual(true);

    // Leaving the viewport again must NOT flip it back to false
    observer!.trigger([{ target: element, isIntersecting: false, intersectionRatio: 0 }]);
    expect(captured.visible).toEqual(true);

    // Once intersected the element is no longer observed at all
    expect(observer!.observed.has(element)).toEqual(false);
  });

  it('resets to not intersected via resetVisible, then observes again', () => {
    const { captured, element, observer } = mount();

    observer!.trigger([{ target: element, isIntersecting: true, intersectionRatio: 1 }]);
    expect(captured.visible).toEqual(true);

    act(() => captured.reset());

    expect(captured.visible).toEqual(false);
    // Once intersected, the (now empty) observer is destroyed, so the re-run
    // of the effect after the reset re-observes through a NEW observer
    const newObserver = MockIntersectionObserver.instances.at(-1)!;
    expect(newObserver).not.toExactlyEqual(observer!);
    expect(newObserver.observed.has(element)).toEqual(true);
  });

  it('does not observe when disabled', () => {
    const instancesBefore = MockIntersectionObserver.instances.length;

    const { captured } = mount({ disabled: true });

    expect(captured.visible).toEqual(false);
    expect(MockIntersectionObserver.instances.length).toEqual(instancesBefore);
  });

  it('unobserves and disconnects on unmount', () => {
    const { element, observer, view } = mount();

    expect(observer!.observed.has(element)).toEqual(true);

    view.unmount();

    expect(observer!.observed.has(element)).toEqual(false);
    expect(observer!.disconnected).toEqual(true);
  });

  it('shares a single observer between elements with the same root and rootMargin', () => {
    const rootMargin = `${++uniqueMarginCounter}px`;
    const visibles: boolean[] = [];

    function Probe({ index }: { index: number }) {
      const [setRef, visible] = useIntersection<HTMLDivElement>({ rootMargin });
      visibles[index] = visible;
      return <div ref={setRef} data-testid={`shared-probe-${index}`} />;
    }

    const instancesBefore = MockIntersectionObserver.instances.length;
    render(
      <>
        <Probe index={0} />
        <Probe index={1} />
      </>
    );

    // Only one IntersectionObserver is created for both elements
    expect(MockIntersectionObserver.instances.length).toEqual(instancesBefore + 1);

    const observer = MockIntersectionObserver.instances.at(-1)!;
    const elements = [screen.getByTestId('shared-probe-0'), screen.getByTestId('shared-probe-1')];
    expect(observer.observed.size).toEqual(2);

    // Each element gets its own visibility state
    observer.trigger([{ target: elements[0], isIntersecting: true, intersectionRatio: 1 }]);
    expect(visibles[0]).toEqual(true);
    expect(visibles[1]).toEqual(false);
  });
});
