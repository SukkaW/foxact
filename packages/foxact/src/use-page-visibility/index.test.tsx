import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { usePageVisibility } from '.';

// document.hidden is a configurable accessor in Happy DOM, override it on the
// document instance and fire the corresponding visibilitychange event
function setPageHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

describe('usePageVisibility', () => {
  afterEach(() => {
    // remove the instance property, restoring the prototype getter
    Reflect.deleteProperty(document, 'hidden');
  });

  it('returns true when the page is visible', () => {
    const { result } = renderHook(() => usePageVisibility());

    expect(result.current).toEqual(true);
  });

  it('flips when the page visibility changes', () => {
    const { result } = renderHook(() => usePageVisibility());

    setPageHidden(true);
    expect(result.current).toEqual(false);

    setPageHidden(false);
    expect(result.current).toEqual(true);
  });

  it('updates every consumer', () => {
    const { result } = renderHook(() => usePageVisibility());
    const { result: result2 } = renderHook(() => usePageVisibility());

    setPageHidden(true);

    expect(result.current).toEqual(false);
    expect(result2.current).toEqual(false);
  });

  it('renders on the server with the same snapshot logic', () => {
    function ServerProbe() {
      return <span>{String(usePageVisibility())}</span>;
    }

    expect(renderToString(<ServerProbe />)).toInclude('true');
  });
});
