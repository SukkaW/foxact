import { describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { ReadonlyURLSearchParams, useReadonlySearchParams } from '.';

function navigate(search: string) {
  act(() => {
    window.history.pushState(null, '', search);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

describe('ReadonlyURLSearchParams', () => {
  it('is a URLSearchParams that can be read', () => {
    const params = new ReadonlyURLSearchParams('?foo=bar');

    expect(params).toBeA(URLSearchParams);
    expect(params.get('foo')).toEqual('bar');
  });

  it('throws on every mutation method', () => {
    const params = new ReadonlyURLSearchParams('?foo=bar');
    const expected = '[foxact/use-readonly-search-params] Method unavailable on `ReadonlyURLSearchParams`';

    /* eslint-disable @typescript-eslint/no-deprecated -- deliberately calling the unavailable methods */
    expect(() => params.append()).toThrow(expected);
    expect(() => params.delete()).toThrow(expected);
    expect(() => params.set()).toThrow(expected);
    expect(() => params.sort()).toThrow(expected);
    /* eslint-enable @typescript-eslint/no-deprecated */
  });
});

describe('useReadonlySearchParams', () => {
  it('reads window.location.search as a ReadonlyURLSearchParams', () => {
    navigate('/?foo=bar&baz=qux');

    const { result } = renderHook(() => useReadonlySearchParams());

    expect(result.current).toBeA(ReadonlyURLSearchParams);
    expect(result.current.get('foo')).toEqual('bar');
    expect(result.current.get('baz')).toEqual('qux');
  });

  it('keeps up-to-date when the URL changes', () => {
    navigate('/?q=before');

    const { result } = renderHook(() => useReadonlySearchParams());
    expect(result.current.get('q')).toEqual('before');

    navigate('/?q=after');
    expect(result.current.get('q')).toEqual('after');
  });

  it('returns the cached instance while the search stays the same', () => {
    navigate('/?q=stable');

    const { result, rerender } = renderHook(() => useReadonlySearchParams());
    const first = result.current;

    rerender();
    expect(result.current).toExactlyEqual(first);

    // even across hook instances: the snapshot is cached module-wide
    const { result: result2 } = renderHook(() => useReadonlySearchParams());
    expect(result2.current).toExactlyEqual(first);
  });

  it('ignores getServerDefaultValue on the client', () => {
    navigate('/?q=client');

    const { result } = renderHook(() => useReadonlySearchParams(() => new URLSearchParams('q=server')));

    expect(result.current.get('q')).toEqual('client');
  });

  it('uses getServerDefaultValue when rendering on the server', () => {
    function ServerProbe() {
      const params = useReadonlySearchParams(() => new URLSearchParams('q=server'));
      return <span>{params.get('q')}</span>;
    }

    expect(renderToString(<ServerProbe />)).toInclude('server');
  });

  it('accepts a ReadonlyURLSearchParams server default as-is', () => {
    const readonlyDefault = new ReadonlyURLSearchParams('q=readonly');

    function ServerProbe() {
      const params = useReadonlySearchParams(() => readonlyDefault);
      return <span>{params.get('q')}</span>;
    }

    expect(renderToString(<ServerProbe />)).toInclude('readonly');
  });

  it('bails out to the closest Suspense fallback on the server without getServerDefaultValue', () => {
    function ServerProbe() {
      const params = useReadonlySearchParams();
      return <span>{params.get('q')}</span>;
    }

    const html = renderToString(
      <Suspense fallback={<span>fallback</span>}>
        <ServerProbe />
      </Suspense>
    );

    expect(html).toInclude('fallback');
  });
});
