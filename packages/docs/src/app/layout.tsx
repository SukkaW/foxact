import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { LastUpdated } from '../last-updated';

import '../styles/main.css';

import { CurrentYear } from 'foxact/current-year';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | foxact - Made by Sukka',
    default: 'foxact - Made by Sukka'
  },
  description: 'React Hooks/Utils done right. For browser, SSR, and React Server Components. Made by Sukka (https://skk.moe)',
  icons: {
    icon: [
      { url: 'https://cdn.skk.moe/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: 'https://cdn.skk.moe/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: 'https://cdn.skk.moe/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://cdn.skk.moe/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: 'https://cdn.skk.moe/favicon/favicon.ico',
    apple: 'https://cdn.skk.moe/favicon/apple-touch-icon.png'
  },
  openGraph: {
    siteName: 'foxact - React Hooks/Utils library made by Sukka',
    images: [
      {
        url: 'https://img.skk.moe/gh/foxact-og.png',
        width: 1200,
        height: 675,
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap();

  const navbar = (
    <Navbar
      logo={
        <div className="flex items-center">
          <img src="https://img.skk.moe/gh/foxact.gif" width={600} height={600} className="h-8 w-8" />
          <span className="font-bold text-xl ml-2 tracking-wide">foxact</span>
        </div>
      }
      projectLink="https://github.com/sukkaw/foxact"
    />
  );

  const footer = (
    <Footer>
      MIT License | Made with
      {' '}
      <span className="text-red-500 mx-1">♥</span>
      {' '}
      by
      {' '}
      <a href="https://skk.moe" className="mx-1 text-black dark:text-white underline underline-offset-2" target="_blank">Sukka</a>
      {' '}
      |
      {' '}
      <span className="mx-1">&copy;</span>
      {' '}
      2023
      {' '}
      <span className="mx-1">-</span>
      {' '}
      {/** @ts-expect-error -- mismatch React version */}
      <CurrentYear defaultYear={2025} />
    </Footer>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/SukkaW/foxact/tree/master/packages/docs"
          footer={footer}
          lastUpdated={<LastUpdated />}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
