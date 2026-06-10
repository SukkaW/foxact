import { describe, it } from 'mocha';
import { expect } from 'earl';

import { fetchJsonp } from '.';

const INTERNAL = '__foxact_jsonp_callbacks__SECRET_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';

// extract `<name>` from the full callback name `window.<INTERNAL>.<name>`
function extractCallbackName(fullCallbackName: string) {
  return fullCallbackName.split('.').at(-1)!;
}

describe('fetchJsonp', () => {
  it('resolves with the data passed to the JSONP callback and cleans up', async () => {
    let callbackName = '';

    const promise = fetchJsonp<{ ok: boolean }>((fullCallbackName) => {
      callbackName = extractCallbackName(fullCallbackName);
      return `https://example.invalid/api?callback=${fullCallbackName}`;
    });

    // the script element is appended with the JSONP url
    const script = document.body.querySelector<HTMLScriptElement>(`script[src*="${callbackName}"]`);
    expect(script).not.toBeNullish();

    // simulate the JSONP response invoking the registered callback
    window[INTERNAL][callbackName]!({ ok: true });

    expect(await promise).toEqual({ ok: true });

    // both the script element and the callback registration are cleaned up
    expect(document.body.querySelector(`script[src*="${callbackName}"]`)).toEqual(null);
    expect(window[INTERNAL][callbackName]).toEqual(undefined);
  });

  it('rejects when the script fails to load', async () => {
    let callbackName = '';

    const promise = fetchJsonp((fullCallbackName) => {
      callbackName = extractCallbackName(fullCallbackName);
      return `https://example.invalid/broken?callback=${fullCallbackName}`;
    });

    const script = document.body.querySelector<HTMLScriptElement>(`script[src*="${callbackName}"]`)!;
    script.dispatchEvent(new Event('error'));

    await expect(promise).toBeRejectedWith('Failed to load script: https://example.invalid/broken');

    // cleanup also happens on error
    expect(document.body.querySelector(`script[src*="${callbackName}"]`)).toEqual(null);
    expect(window[INTERNAL][callbackName]).toEqual(undefined);
  });

  it('applies scriptElOptions to the script element', () => {
    let callbackName = '';

    const promise = fetchJsonp((fullCallbackName) => {
      callbackName = extractCallbackName(fullCallbackName);
      return `https://example.invalid/api?callback=${fullCallbackName}`;
    }, { id: 'jsonp-script', crossOrigin: 'anonymous' });

    const script = document.body.querySelector<HTMLScriptElement>('script#jsonp-script')!;
    expect(script).not.toBeNullish();
    expect(script.crossOrigin).toEqual('anonymous');
    expect(script.async).toEqual(true);

    // settle the promise to clean up
    window[INTERNAL][callbackName]!(null);
    return promise;
  });
});
