import type { AppProps } from 'next/app';
import '../styles/main.css';
import { createElement } from 'react';

export default function Nextra({ Component, pageProps }: AppProps) {
  return createElement(Component, pageProps);
}
