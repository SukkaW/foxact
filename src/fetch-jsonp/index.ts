declare global {
  interface Window {
    __foxact_jsonp_callbacks__SECRET_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Record<string, ((data: any) => void) | undefined>
  }
}

const INTERNAL = '__foxact_jsonp_callbacks__SECRET_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';

export function fetchJsonp<T>(getUrl: (callbackName: string) => string) {
  if (typeof window === 'undefined') {
    throw new TypeError('fetchJsonp is only available in the browser');
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- initialization
  if (!window[INTERNAL]) {
    Object.defineProperty(window, INTERNAL, {
      value: {},
      writable: true,
      configurable: true,
      enumerable: false
    });
  }

  const callbackName = `$${Date.now()}_${Math.random().toString().slice(2)}$`;
  const fullCallbackName = `window.${INTERNAL}.${callbackName}`;
  // eslint-disable-next-line prefer-object-has-own -- conflict check
  if (Object.prototype.hasOwnProperty.call(window[INTERNAL], callbackName)) {
    throw new TypeError(`Callback name conflict: ${callbackName}`);
  }

  const url = getUrl(fullCallbackName);

  return new Promise<T>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const cleanup = () => {
      script.removeEventListener('error', handleScriptError);
      script.remove();

      if (window[INTERNAL][callbackName]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- cleanup
        delete window[INTERNAL][callbackName];
      }
    };

    function handleScriptError() {
      cleanup();
      reject(new Error(`Failed to load script: ${url}`));
    };

    script.addEventListener('error', handleScriptError);

    window[INTERNAL][callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    document.body.append(script);
  });
}
