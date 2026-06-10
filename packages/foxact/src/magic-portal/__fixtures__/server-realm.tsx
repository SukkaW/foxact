import { renderToString } from 'react-dom/server';
import { createMagicPortal } from '..';

// Runs inside the server-realm worker (see test/server-realm), where
// `typeof window === 'undefined'` natively: noSSR() throws, so the
// Suspense boundary renders the ssrFallback into the HTML.
export default function run() {
  const [PortalProvider, PortalTarget] = createMagicPortal('ssr-fallback');

  return renderToString(
    <PortalProvider>
      <PortalTarget ssrFallback={<span>skeleton</span>} />
    </PortalProvider>
  );
}
