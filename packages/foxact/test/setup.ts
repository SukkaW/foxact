import { GlobalRegistrator } from '@happy-dom/global-registrator';

// react-dom/client requires a DOM. Register Happy DOM globals (document,
// window, etc.) before anything imports React DOM.
GlobalRegistrator.register();

declare global {
  // eslint-disable-next-line vars-on-top -- types
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Opt-in to React's act() environment so act() doesn't warn.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
