import { describe, it } from 'mocha';
import { expect } from 'earl';

import { createContext, use } from 'react';
import { render } from '@testing-library/react';
import { ComposeContextProvider } from '.';

const ThemeContext = createContext('light');
const LanguageContext = createContext('en');

function Probe() {
  return <span>{use(ThemeContext)}-{use(LanguageContext)}</span>;
}

describe('ComposeContextProvider', () => {
  it('composes multiple providers', () => {
    const { container } = render(
      <ComposeContextProvider contexts={[
        <ThemeContext value="dark" key="theme" />,
        <LanguageContext value="zh" key="language" />
      ]}
      >
        <Probe />
      </ComposeContextProvider>
    );

    expect(container.textContent).toEqual('dark-zh');
  });

  it('nests providers in order, the first being the outermost', () => {
    const { container } = render(
      <ComposeContextProvider contexts={[
        <ThemeContext value="outer" key="outer" />,
        <ThemeContext value="inner" key="inner" />
      ]}
      >
        <Probe />
      </ComposeContextProvider>
    );

    // the innermost (last) provider wins for the same context
    expect(container.textContent).toEqual('inner-en');
  });

  it('renders the children directly with an empty contexts array', () => {
    const { container } = render(
      <ComposeContextProvider contexts={[]}>
        <Probe />
      </ComposeContextProvider>
    );

    expect(container.textContent).toEqual('light-en');
  });
});
