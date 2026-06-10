import { describe, it } from 'mocha';
import { expect } from 'earl';

import { render } from '@testing-library/react';
import { mergeRefs } from '.';

function createObjectRef<T>(): React.RefObject<T | null> {
  return { current: null };
}

describe('mergeRefs', () => {
  it('sets object refs and invokes callback refs', () => {
    const objectRef = createObjectRef<HTMLDivElement>();
    const received: Array<HTMLDivElement | null> = [];

    const { container } = render(
      <div ref={mergeRefs(objectRef, (el) => { received.push(el); })} />
    );

    // eslint-disable-next-line testing-library/no-node-access -- the DOM node identity is exactly what mergeRefs must capture
    const div = container.firstElementChild as HTMLDivElement;
    expect(objectRef.current!).toExactlyEqual(div);
    expect(received).toEqual([div]);
  });

  it('skips nullish refs', () => {
    const objectRef = createObjectRef<HTMLDivElement>();

    expect(() => render(<div ref={mergeRefs(undefined, null, objectRef)} />)).not.toThrow();
    expect(objectRef.current).not.toBeNullish();
  });

  it('runs React 19 ref callback cleanups and bridges legacy callbacks with null on unmount', () => {
    const events: string[] = [];

    const react19Ref = () => {
      events.push('attach:react19');
      return () => { events.push('cleanup:react19'); };
    };
    const legacyRef = (el: HTMLDivElement | null) => {
      events.push(`attach:legacy:${el === null ? 'null' : 'element'}`);
    };

    const view = render(<div ref={mergeRefs<HTMLDivElement>(react19Ref, legacyRef)} />);

    expect(events).toEqual(['attach:react19', 'attach:legacy:element']);

    view.unmount();

    // React 19 cleanup runs, the legacy callback is manually bridged with null
    expect(events).toEqual([
      'attach:react19',
      'attach:legacy:element',
      'cleanup:react19',
      'attach:legacy:null'
    ]);
  });
});
