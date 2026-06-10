import { GlobalRegistrator } from '@happy-dom/global-registrator';

// react-dom/client requires a DOM. Register Happy DOM globals (document,
// window, etc.) before anything imports React DOM.
// A real URL (instead of the default about:blank) so history.pushState works.
// Resource loading is disabled: tests must never hit the real network
// (e.g. <script src> elements created by fetch-jsonp).
GlobalRegistrator.register({
  url: 'https://foxact.skk.moe/',
  settings: {
    disableJavaScriptFileLoading: true,
    disableCSSFileLoading: true,
    // fire `load` (not `error`) on skipped resources, so code with error
    // handlers (e.g. fetch-jsonp) is not disturbed
    handleDisabledFileLoadingAsSuccess: true,
    // never perform real navigation (and the network request it implies),
    // e.g. when open-new-tab clicks its <a target="_blank" /> element
    navigation: {
      disableMainFrameNavigation: true,
      disableChildFrameNavigation: true,
      disableChildPageNavigation: true
    }
  }
});

declare global {
  // eslint-disable-next-line vars-on-top -- types
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Opt-in to React's act() environment so act() doesn't warn.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
