import { afterEach, describe, it } from 'mocha';
import { expect } from 'earl';

import { isSafari } from '.';

const SAFARI_DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const SAFARI_IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const LEGACY_MOBILE_SAFARI_UA = 'Mozilla/5.0 (Linux; U; Android 4.0.3) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari 534.30';
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function setUserAgent(userAgent: string) {
  Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true });
}

describe('isSafari', () => {
  afterEach(() => {
    // remove the instance property, restoring the prototype getter
    Reflect.deleteProperty(navigator, 'userAgent');
  });

  it('detects desktop Safari', () => {
    setUserAgent(SAFARI_DESKTOP_UA);
    expect(isSafari()).toEqual(true);
  });

  it('detects iOS Safari', () => {
    setUserAgent(SAFARI_IOS_UA);
    expect(isSafari()).toEqual(true);
  });

  it('detects legacy mobile Safari', () => {
    setUserAgent(LEGACY_MOBILE_SAFARI_UA);
    expect(isSafari()).toEqual(true);
  });

  it('does not detect Chrome, despite "Safari" in its user agent', () => {
    setUserAgent(CHROME_UA);
    expect(isSafari()).toEqual(false);
  });

  it('returns false in the default test environment', () => {
    expect(isSafari()).toEqual(false);
  });
});
