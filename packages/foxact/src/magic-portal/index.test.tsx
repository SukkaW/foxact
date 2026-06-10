/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   the portal target is located via the public `data-foxact-magic-portal-target`
   attribute (no role/text), and raw node handling is deliberate here: see the
   warning below about earl traversing portal-hosting nodes */
import { describe, it } from 'mocha';
import { expect } from 'earl';

import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { runOnServer } from '../../test/server-realm';
import { createMagicPortal } from '.';
import { createMagicPortal as createMagicPortalAlias } from '../create-magic-portal';

describe('createMagicPortal', () => {
  it('teleports the portal content into the portal target', () => {
    const [PortalProvider, PortalTarget, PortalContent] = createMagicPortal('teleport');

    const { container } = render(
      <PortalProvider>
        <header>
          <PortalTarget />
        </header>
        <main>
          <PortalContent>
            <span>portal content</span>
          </PortalContent>
        </main>
      </PortalProvider>
    );

    // NOTE: never pass a portal-hosting DOM node to earl's expect() itself:
    // React attaches its fiber tree to the node and earl hangs traversing it
    const target = container.querySelector('[data-foxact-magic-portal-target="teleport"]');
    // the content lives inside the target, NOT inside <main /> where it is declared
    expect(target?.textContent).toEqual('portal content');
    expect(container.querySelector('main')?.textContent).toEqual('');
  });

  it('renders the target as a custom element type via the as prop', () => {
    const [PortalProvider, PortalTarget] = createMagicPortal('custom-as');

    const { container } = render(
      <PortalProvider>
        <PortalTarget as="section" id="target" />
      </PortalProvider>
    );

    const target = container.querySelector<HTMLElement>('section#target');
    expect(target?.dataset.foxactMagicPortalTarget).toEqual('custom-as');
  });

  it('renders nothing through PortalContent when no target is mounted', () => {
    const [PortalProvider, , PortalContent] = createMagicPortal('no-target');

    const { container } = render(
      <PortalProvider>
        <PortalContent>
          <span>orphan</span>
        </PortalContent>
      </PortalProvider>
    );

    expect(container.textContent).toEqual('');
  });

  it('renders nothing on the server by default', () => {
    const [PortalProvider, PortalTarget, PortalContent] = createMagicPortal('ssr-default');

    const html = renderToString(
      <PortalProvider>
        <PortalTarget />
        <PortalContent>
          <span>portal content</span>
        </PortalContent>
      </PortalProvider>
    );

    expect(html).toInclude('data-foxact-magic-portal-target');
    expect(html).not.toInclude('portal content');
  });

  it('renders the real target on the client even with ssrFallback (noSSR is a no-op)', () => {
    const [PortalProvider, PortalTarget] = createMagicPortal('ssr-fallback');

    const { container } = render(
      <PortalProvider>
        <PortalTarget ssrFallback={<span>skeleton</span>} />
      </PortalProvider>
    );

    expect(container.querySelector('[data-foxact-magic-portal-target="ssr-fallback"]') !== null).toEqual(true);
    expect(container.textContent).not.toInclude('skeleton');
  });

  // ssrFallback relies on noSSR()'s `typeof window` check, which only matters
  // in a real server realm (worker thread), where window natively is undefined
  it('emits the ssrFallback into the server-rendered HTML (worker thread)', async function () {
    this.timeout(10000); // worker spawn + swc compilation

    const html = await runOnServer<string>(path.join(__dirname, '__fixtures__/server-realm.tsx'));

    expect(html).toInclude('skeleton');
    expect(html).not.toInclude('data-foxact-magic-portal-target');
  });

  it('is also exported from foxact/create-magic-portal', () => {
    expect(createMagicPortalAlias).toExactlyEqual(createMagicPortal);
  });
});
