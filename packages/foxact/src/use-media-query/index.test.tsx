import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from '.';

const PHONE_QUERY = '(max-width: 768px)';

declare global {
  interface Window {
    happyDOM: {
      setViewport: (viewport: { width?: number, height?: number }) => void
    }
  }
}

// Happy DOM evaluates matchMedia against its viewport and dispatches real
// `change` events when the viewport is resized
function setViewportWidth(width: number) {
  act(() => window.happyDOM.setViewport({ width }));
}

describe('useMediaQuery', () => {
  afterEach(() => setViewportWidth(1024));

  it('returns the current match state', () => {
    const { result } = renderHook(() => useMediaQuery(PHONE_QUERY));
    expect(result.current).toEqual(false);

    const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 769px)'));
    expect(result2.current).toEqual(true);
  });

  it('tracks viewport changes', () => {
    const { result } = renderHook(() => useMediaQuery(PHONE_QUERY));

    expect(result.current).toEqual(false);

    setViewportWidth(500);
    expect(result.current).toEqual(true);

    setViewportWidth(1024);
    expect(result.current).toEqual(false);
  });

  it('tracks the latest media query when it changes between renders', () => {
    const { result, rerender } = renderHook((mq: string) => useMediaQuery(mq), {
      initialProps: PHONE_QUERY
    });

    expect(result.current).toEqual(false);

    rerender('(min-width: 769px)');
    expect(result.current).toEqual(true);
  });

  it('updates every consumer of the same media query', () => {
    const { result } = renderHook(() => useMediaQuery(PHONE_QUERY));
    const { result: result2 } = renderHook(() => useMediaQuery(PHONE_QUERY));

    setViewportWidth(500);

    expect(result.current).toEqual(true);
    expect(result2.current).toEqual(true);
  });

  it('ignores serverValue on the client', () => {
    const { result } = renderHook(() => useMediaQuery(PHONE_QUERY, true));

    expect(result.current).toEqual(false);
  });

  it('uses serverValue when rendering on the server', () => {
    function ServerProbe({ serverValue }: { serverValue: boolean }) {
      return <span>{String(useMediaQuery(PHONE_QUERY, serverValue))}</span>;
    }

    expect(renderToString(<ServerProbe serverValue />)).toInclude('true');
    expect(renderToString(<ServerProbe serverValue={false} />)).toInclude('false');
  });

  it('bails out to the closest Suspense fallback on the server without serverValue', () => {
    function ServerProbe() {
      return <span>{String(useMediaQuery(PHONE_QUERY))}</span>;
    }

    const html = renderToString(
      <Suspense fallback={<span>fallback</span>}>
        <ServerProbe />
      </Suspense>
    );

    expect(html).toInclude('fallback');
  });
});
