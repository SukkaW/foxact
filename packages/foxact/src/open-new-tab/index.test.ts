import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { openInNewTab } from '.';

const SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

describe('openInNewTab', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'userAgent');
    Reflect.deleteProperty(window, 'open');
  });

  it('clicks a temporary safe anchor in non-Safari browsers', async () => {
    let clickedAnchor: HTMLAnchorElement | null = null;
    document.body.addEventListener('click', (e) => {
      clickedAnchor = e.target as HTMLAnchorElement;
    }, { once: true });

    openInNewTab('https://example.com/page');

    expect(clickedAnchor).not.toBeNullish();
    expect(clickedAnchor!.href).toEqual('https://example.com/page');
    expect(clickedAnchor!.target).toEqual('_blank');
    // noopener noreferrer prevents reverse tabnabbing
    expect(clickedAnchor!.rel).toEqual('noopener noreferrer');
    expect(document.body.contains(clickedAnchor)).toEqual(true);

    // the anchor is removed in a microtask
    await Promise.resolve();
    expect(document.body.contains(clickedAnchor)).toEqual(false);
  });

  it('uses window.open in Safari', () => {
    Object.defineProperty(navigator, 'userAgent', { value: SAFARI_UA, configurable: true });

    const openCalls: Array<[string | URL | undefined, string | undefined]> = [];
    Object.defineProperty(window, 'open', {
      value(url?: string | URL, target?: string) {
        openCalls.push([url, target]);
        return null;
      },
      configurable: true
    });

    openInNewTab('https://example.com/safari');

    expect(openCalls).toEqual([['https://example.com/safari', '_blank']]);
  });
});
