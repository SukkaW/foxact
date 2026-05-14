import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import { LastUpdated } from '@/last-updated';
import { Head } from 'nextra/components';

import '@/styles/main.css';

import { CurrentYear } from 'foxact/current-year';
import type { Metadata } from 'next';
import type { Graph, Person, SoftwareSourceCode, WebSite, WebPage } from 'schema-dts';

const jsonLd: Graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://skk.moe/#identity',
      name: 'Sukka',
      url: 'https://skk.moe',
      sameAs: [
        'https://github.com/SukkaW',
        'https://twitter.com/isukkaw'
      ]
    } satisfies Person,
    {
      '@type': 'WebSite',
      '@id': 'https://foxact.skk.moe/#website',
      url: 'https://foxact.skk.moe',
      name: 'foxact',
      description: 'React Hooks/Utils done right. For browser, SSR, and React Server Components.',
      author: { '@id': 'https://skk.moe/#identity' }
    } satisfies WebSite,
    {
      '@type': 'WebPage',
      '@id': 'https://foxact.skk.moe/#webpage',
      url: 'https://foxact.skk.moe',
      name: 'foxact - Made by Sukka',
      isPartOf: { '@id': 'https://foxact.skk.moe/#website' },
      about: { '@id': 'https://foxact.skk.moe/#software' },
      description: 'Documentation for foxact — React Hooks/Utils done right. For browser, SSR, and React Server Components.'
    } satisfies WebPage,
    {
      '@type': 'SoftwareSourceCode',
      '@id': 'https://foxact.skk.moe/#software',
      name: 'foxact',
      description: 'React Hooks/Utils done right. For browser, SSR, and React Server Components. Made by Sukka.',
      url: 'https://foxact.skk.moe',
      codeRepository: 'https://github.com/SukkaW/foxact',
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Node.js',
      license: 'https://opensource.org/licenses/MIT',
      author: { '@id': 'https://skk.moe/#identity' }
    } satisfies SoftwareSourceCode
  ]
};

const serializeJsonLd = (data: unknown) => JSON.stringify(data).replaceAll('<', String.raw`\u003c`).replaceAll('>', String.raw`\u003e`);


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
      {/* eslint-disable-next-line @eslint-react/dom/no-unsafe-target-blank -- my own homepage */}
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </body>
    </html>
  );
}
