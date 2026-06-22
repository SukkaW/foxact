import { describe, it } from 'mocha';
import { expect } from 'earl';

import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createPolymorphic } from '.';
import type { PolymorphicComponentProps } from '.';
import { mergeProps } from '../merge-props';

const { renderPolymorphic } = createPolymorphic('as');

interface ButtonOwnProps { variant?: 'primary' | 'secondary' }

type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentProps<'as', C, ButtonOwnProps>;

function Button<C extends React.ElementType = 'button'>({ variant, ref, ...rest }: ButtonProps<C>) {
  return renderPolymorphic({
    props: mergeProps(
      { className: `btn${variant ? ` btn-${variant}` : ''}`, style: { display: 'inline-flex' } },
      rest
    ),
    defaultComponent: 'button',
    ref
  });
}

function ButtonWithRef(props: Record<string, unknown>) {
  const { ref: externalRef, ...rest } = props;
  return renderPolymorphic({
    props: rest,
    defaultComponent: 'button',
    ref: externalRef as React.Ref<any>
  });
}

function LinkButton(props: Record<string, unknown>) {
  const { as: As, ref: externalRef, ...rest } = props;
  return renderPolymorphic({
    props: { as: As, ...rest },
    defaultComponent: 'button',
    ref: externalRef as React.Ref<any>
  });
}

describe('createPolymorphic', () => {
  it('renders the default component when no polymorphic prop is provided', () => {
    render(<Button data-testid="btn">click</Button>);

    const el = screen.getByTestId('btn');
    expect(el.tagName).toEqual('BUTTON');
    expect(el.textContent).toEqual('click');
  });

  it('renders an intrinsic element when the polymorphic prop is a string tag', () => {
    render(<Button as="a" href="/home" data-testid="link">go</Button>);

    const el = screen.getByTestId('link');
    expect(el.tagName).toEqual('A');
    expect(el.getAttribute('href')).toEqual('/home');
    expect(el.textContent).toEqual('go');
  });

  it('renders a custom component when the polymorphic prop is a component type', () => {
    function Card(props: React.ComponentProps<'section'>) {
      return <section {...props} />;
    }

    render(<Button as={Card} data-testid="card">content</Button>);

    const el = screen.getByTestId('card');
    expect(el.tagName).toEqual('SECTION');
    expect(el.textContent).toEqual('content');
  });

  it('clones a React element when the polymorphic prop is an element', () => {
    render(<Button as={<span data-base="yes" />} data-testid="cloned">text</Button>);

    const el = screen.getByTestId('cloned');
    expect(el.tagName).toEqual('SPAN');
    expect(el.dataset.base).toEqual('yes');
    expect(el.textContent).toEqual('text');
  });

  it('forwards rest props and strips the polymorphic prop from the output', () => {
    render(<Button as="div" role="button" data-testid="rest" />);

    const el = screen.getByTestId('rest');
    expect(el.tagName).toEqual('DIV');
    expect(el.getAttribute('role')).toEqual('button');
    expect(el.getAttribute('as')).toEqual(null);
  });

  it('works with server-side rendering', () => {
    const html = renderToString(<Button data-testid="ssr">ssr</Button>);
    expect(html).toInclude('ssr');
    expect(html).toInclude('button');
  });

  it('forwards ref to the rendered element', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<ButtonWithRef ref={ref} data-testid="ref-btn" />);

    const el = screen.getByTestId('ref-btn');
    expect(ref.current!).toExactlyEqual(el);
  });

  it('forwards ref when rendering as a different element', () => {
    const ref = createRef<HTMLAnchorElement>();

    render(<LinkButton as="a" ref={ref} href="/test" data-testid="ref-link" />);

    const el = screen.getByTestId('ref-link');
    expect(el.tagName).toEqual('A');
    expect(ref.current!).toExactlyEqual(el);
  });
});

describe('polymorphic + mergeProps composition', () => {
  it('applies base className when consumer provides none', () => {
    render(<Button data-testid="base-only">click</Button>);

    const el = screen.getByTestId('base-only');
    expect(el.getAttribute('class')).toEqual('btn');
  });

  it('concatenates base and consumer classNames', () => {
    render(<Button className="extra" data-testid="both-cls">click</Button>);

    const el = screen.getByTestId('both-cls');
    expect(el.getAttribute('class')).toEqual('extra btn');
  });

  it('applies base style when consumer provides none', () => {
    render(<Button data-testid="base-style">click</Button>);

    const el = screen.getByTestId('base-style');
    expect(el.style.display).toEqual('inline-flex');
  });

  it('shallow-merges base and consumer styles with consumer winning', () => {
    render(<Button style={{ display: 'block', color: 'red' }} data-testid="merge-style">click</Button>);

    const el = screen.getByTestId('merge-style');
    expect(el.style.display).toEqual('block');
    expect(el.style.color).toEqual('red');
  });

  it('uses variant own prop to derive base className without leaking it to the DOM', () => {
    render(<Button variant="primary" data-testid="variant">click</Button>);

    const el = screen.getByTestId('variant');
    expect(el.getAttribute('class')).toEqual('btn btn-primary');
    expect(el.getAttribute('variant')).toEqual(null);
  });
});

describe('createPolymorphic with custom prop name', () => {
  it('supports a custom polymorphic prop name', () => {
    const { renderPolymorphic: renderComponent } = createPolymorphic('component');

    type BoxProps<C extends React.ElementType = 'div'> =
      PolymorphicComponentProps<'component', C, { padding?: number }>;

    function Box<C extends React.ElementType = 'div'>(props: BoxProps<C>) {
      return renderComponent({ props, defaultComponent: 'div' });
    }

    render(<Box component="section" data-testid="custom">hello</Box>);

    const el = screen.getByTestId('custom');
    expect(el.tagName).toEqual('SECTION');
    expect(el.getAttribute('component')).toEqual(null);
  });
});
