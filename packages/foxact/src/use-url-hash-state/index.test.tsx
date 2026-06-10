/* eslint-disable sukka/browser/prefer-location-assign -- directly manipulating the hash is the point of these tests */
import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { unstable_useUrlHashState as useUrlHashState } from '.';

// Happy DOM fires a real hashchange event on location.hash assignment, just
// like a browser: asynchronously, on the next tick. Await it inside act().
function nextTick() {
  return new Promise<void>((resolve) => { setTimeout(resolve, 0); });
}

function setHash(hash: string) {
  return act(async () => {
    window.location.assign(hash);
    await nextTick();
  });
}

function invoke(fn: () => void) {
  return act(async () => {
    fn();
    await nextTick();
  });
}

describe('useUrlHashState', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('returns the default value when the hash is empty', () => {
    const { result } = renderHook(() => useUrlHashState('tab', 'home'));

    expect(result.current[0]).toEqual('home');
  });

  it('returns null without a default value', () => {
    const { result } = renderHook(() => useUrlHashState<string>('tab'));

    expect(result.current[0]).toEqual(null);
  });

  it('reads the existing value from the hash', () => {
    window.location.hash = '#tab=settings';

    const { result } = renderHook(() => useUrlHashState('tab', 'home'));

    expect(result.current[0]).toEqual('settings');
  });

  it('tracks hash changes', async () => {
    const { result } = renderHook(() => useUrlHashState('tab', 'home'));

    await setHash('#tab=profile');

    expect(result.current[0]).toEqual('profile');
  });

  it('updates the hash through the setter', async () => {
    const { result } = renderHook(() => useUrlHashState('tab', 'home'));

    await invoke(() => result.current[1]('settings'));

    expect(window.location.hash).toEqual('#tab=settings');
    expect(result.current[0]).toEqual('settings');
  });

  it('removes the key when set back to the default value or null', async () => {
    window.location.hash = '#tab=settings&q=1';

    const { result } = renderHook(() => useUrlHashState('tab', 'home'));

    await invoke(() => result.current[1]('home'));

    expect(window.location.hash).toEqual('#q=1');
    expect(result.current[0]).toEqual('home');
  });

  it('supports functional updates', async () => {
    window.location.hash = '#count=2';

    const options = {
      serializer: String,
      deserializer: Number
    };

    const { result } = renderHook(() => useUrlHashState('count', 0, options));

    expect(result.current[0]).toEqual(2);

    await invoke(() => result.current[1]((prev) => (prev ?? 0) + 1));

    expect(window.location.hash).toEqual('#count=3');
    expect(result.current[0]).toEqual(3);
  });

  it('uses the default value when rendering on the server', () => {
    function ServerProbe() {
      const [value] = useUrlHashState('tab', 'server-default');
      return <span>{value}</span>;
    }

    expect(renderToString(<ServerProbe />)).toInclude('server-default');
  });

  it('bails out to the closest Suspense fallback on the server without a default value', () => {
    function ServerProbe() {
      const [value] = useUrlHashState<string>('tab');
      return <span>{value}</span>;
    }

    const html = renderToString(
      <Suspense fallback={<span>fallback</span>}>
        <ServerProbe />
      </Suspense>
    );

    expect(html).toInclude('fallback');
  });
});
