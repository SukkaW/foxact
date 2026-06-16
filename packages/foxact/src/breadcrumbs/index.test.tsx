/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   the portal target is located via the public `data-foxact-magic-portal-target`
   attribute, and raw node handling is deliberate here */
import { describe, it } from 'mocha';
import { expect } from 'earl';

import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { createBreadcrumbs } from '.';
import { createBreadcrumbs as createBreadcrumbsAlias } from '../create-breadcrumbs';

describe('createBreadcrumbs', () => {
  it('renders the full breadcrumb chain into the portal target', () => {
    const [Provider, Target, Item, Page] = createBreadcrumbs('test-chain');

    const { container } = render(
      <Provider>
        <header>
          <Target />
        </header>
        <main>
          <Item title="Products" href="/products">
            <Item title="Widgets" href="/products/widgets">
              <Page title="Gizmo">
                {(items) => (
                  <ol data-testid="breadcrumb">
                    {items.map((item) => (
                      <li key={item.href ?? item.title}>
                        {item.href ? <a href={item.href}>{item.title}</a> : <span>{item.title}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </Page>
            </Item>
          </Item>
        </main>
      </Provider>
    );

    const target = container.querySelector('[data-foxact-magic-portal-target="test-chain"]');
    expect(target?.textContent).toEqual('ProductsWidgetsGizmo');
    expect(container.querySelector('main')?.textContent).toEqual('');

    const links = target?.querySelectorAll('a');
    expect(links?.length).toEqual(2);
    expect(links?.[0]?.getAttribute('href')).toEqual('/products');
    expect(links?.[0]?.textContent).toEqual('Products');
    expect(links?.[1]?.getAttribute('href')).toEqual('/products/widgets');
    expect(links?.[1]?.textContent).toEqual('Widgets');

    const lastItem = target?.querySelectorAll('li');
    expect(lastItem?.[2]?.querySelector('span')?.textContent).toEqual('Gizmo');
    expect(lastItem?.[2]?.querySelector('a')).toEqual(null);
  });

  it('passes custom metadata through to the render function', () => {
    const [Provider, Target, Item, Page] = createBreadcrumbs<{ icon: string }>('test-meta');

    const { container } = render(
      <Provider>
        <header>
          <Target />
        </header>
        <Item title="Dashboard" href="/dashboard" meta={{ icon: 'home' }}>
          <Page title="Settings" meta={{ icon: 'gear' }}>
            {(items) => (
              <ol>
                {items.map((item) => (
                  <li key={item.href ?? item.title} data-icon={item.meta?.icon}>
                    {item.title}
                  </li>
                ))}
              </ol>
            )}
          </Page>
        </Item>
      </Provider>
    );

    const target = container.querySelector('[data-foxact-magic-portal-target="test-meta"]');
    const listItems = target?.querySelectorAll('li');
    expect(listItems?.length).toEqual(2);
    expect(listItems?.[0]?.dataset.icon).toEqual('home');
    expect(listItems?.[1]?.dataset.icon).toEqual('gear');
  });

  it('renders nothing through the portal when no target is mounted', () => {
    const [Provider, , Item, Page] = createBreadcrumbs('no-target');

    const { container } = render(
      <Provider>
        <Item title="Products" href="/products">
          <Page title="Detail">
            {(items) => <ol>{items.map((item) => <li key={item.title}>{item.title}</li>)}</ol>}
          </Page>
        </Item>
      </Provider>
    );

    expect(container.textContent).toEqual('');
  });

  it('renders nothing on the server', () => {
    const [Provider, Target, Item, Page] = createBreadcrumbs('ssr-default');

    const html = renderToString(
      <Provider>
        <Target />
        <Item title="Products" href="/products">
          <Page title="Detail">
            {(items) => <ol>{items.map((item) => <li key={item.title}>{item.title}</li>)}</ol>}
          </Page>
        </Item>
      </Provider>
    );

    expect(html).toInclude('data-foxact-magic-portal-target');
    expect(html).not.toInclude('Products');
    expect(html).not.toInclude('Detail');
  });

  it('supports the as prop on the portal target', () => {
    const [Provider, Target] = createBreadcrumbs('custom-as');

    const { container } = render(
      <Provider>
        <Target as="nav" aria-label="breadcrumb" />
      </Provider>
    );

    const target = container.querySelector<HTMLElement>('nav[aria-label="breadcrumb"]');
    expect(target?.dataset.foxactMagicPortalTarget).toEqual('custom-as');
  });

  it('works with a single page and no intermediate items', () => {
    const [Provider, Target, , Page] = createBreadcrumbs('single-page');

    const { container } = render(
      <Provider>
        <header>
          <Target />
        </header>
        <Page title="Home">
          {(items) => (
            <ol>{items.map((item) => <li key={item.title}>{item.title}</li>)}</ol>
          )}
        </Page>
      </Provider>
    );

    const target = container.querySelector('[data-foxact-magic-portal-target="single-page"]');
    expect(target?.textContent).toEqual('Home');
    const listItems = target?.querySelectorAll('li');
    expect(listItems?.length).toEqual(1);
  });

  it('last item in the chain has no href', () => {
    const [Provider, Target, Item, Page] = createBreadcrumbs('no-href-last');

    let capturedItems: Array<{ title: string, href?: string, meta?: unknown }> = [];

    render(
      <Provider>
        <Target />
        <Item title="Products" href="/products">
          <Page title="Current Page">
            {(items) => {
              capturedItems = items;
              return null;
            }}
          </Page>
        </Item>
      </Provider>
    );

    expect(capturedItems.length).toEqual(2);
    expect(capturedItems[0].title).toEqual('Products');
    expect(capturedItems[0].href).toEqual('/products');
    expect(capturedItems[1].title).toEqual('Current Page');
    expect(capturedItems[1].href).toEqual(undefined);
  });

  it('accepts a ReactElement child with useBreadcrumbs for RSC-friendly usage', () => {
    const [Provider, Target, Item, Page, useBreadcrumbs] = createBreadcrumbs('element-child');

    function BreadcrumbUI() {
      const items = useBreadcrumbs();
      return (
        <ol>
          {items.map((item) => (
            <li key={item.href ?? item.title}>
              {item.href ? <a href={item.href}>{item.title}</a> : <span>{item.title}</span>}
            </li>
          ))}
        </ol>
      );
    }

    const { container } = render(
      <Provider>
        <header>
          <Target />
        </header>
        <Item title="Products" href="/products">
          <Page title="Detail">
            <BreadcrumbUI />
          </Page>
        </Item>
      </Provider>
    );

    const target = container.querySelector('[data-foxact-magic-portal-target="element-child"]');
    expect(target?.textContent).toEqual('ProductsDetail');

    const links = target?.querySelectorAll('a');
    expect(links?.length).toEqual(1);
    expect(links?.[0]?.getAttribute('href')).toEqual('/products');

    const lastItem = target?.querySelectorAll('span');
    expect(lastItem?.[0]?.textContent).toEqual('Detail');
  });

  it('useBreadcrumbs returns the chain up to the current nesting level', () => {
    const [Provider, , Item, , useBreadcrumbs] = createBreadcrumbs('hook-only');

    let outerItems: Array<{ title: string, href?: string }> = [];
    let innerItems: Array<{ title: string, href?: string }> = [];

    function OuterReader() {
      outerItems = useBreadcrumbs();
      return null;
    }

    function InnerReader() {
      innerItems = useBreadcrumbs();
      return null;
    }

    render(
      <Provider>
        <Item title="A" href="/a">
          <OuterReader />
          <Item title="B" href="/a/b">
            <InnerReader />
          </Item>
        </Item>
      </Provider>
    );

    expect(outerItems.length).toEqual(1);
    expect(outerItems[0].title).toEqual('A');
    expect(innerItems.length).toEqual(2);
    expect(innerItems[0].title).toEqual('A');
    expect(innerItems[1].title).toEqual('B');
  });

  it('is also exported from foxact/create-breadcrumbs', () => {
    expect(createBreadcrumbsAlias).toExactlyEqual(createBreadcrumbs);
  });
});
