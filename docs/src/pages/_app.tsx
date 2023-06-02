import type { AppProps } from 'next/app';
import '../styles/main.css';

export default function Nextra({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  );
}
