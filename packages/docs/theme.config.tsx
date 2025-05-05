import { useConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import type { DocsThemeConfig } from 'nextra-theme-docs';
import { CurrentYear } from 'foxact/current-year';

import { withTrailingSlash } from 'ufo';

const config: DocsThemeConfig = {
  logo: (
    <div className="flex items-center">
      <img src="https://pic.skk.moe/gh/foxact.gif" width={600} height={600} className="h-8 w-8" />
      <span className="font-bold text-xl ml-2 tracking-wide">foxact</span>
    </div>
  ),
  project: {
    link: 'https://github.com/sukkaw/foxact'
  },
  i18n: [],
  docsRepositoryBase: 'https://github.com/SukkaW/foxact/tree/master/packages/docs/',
  gitTimestamp() {
    return null;
  },
  head() {
    // Custom <head /> goes here
    // const config = useConfig();
    // const { route } = useRouter();
    return (
      <>
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="icon" href="https://cdn.skk.moe/favicon/android-chrome-512x512.png" sizes="512x512" type="image/png" />
        <link rel="icon" href="https://cdn.skk.moe/favicon/android-chrome-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="https://cdn.skk.moe/favicon/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="https://cdn.skk.moe/favicon/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="shortcut icon" href="https://cdn.skk.moe/favicon/favicon.ico" />
        <link rel="apple-touch-icon" href="https://cdn.skk.moe/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="https://cdn.skk.moe/favicon/safari-pinned-tab.svg" color="#211b24" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://esm.sh" />
        <link rel="preconnect" href="https://pic.skk.moe" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fastly.jsdelivr.net" />
      </>
    );
  },
  useNextSeoProps() {
    const config = useConfig();
    const title = config.frontMatter.title ? `${config.frontMatter.title} | foxact - Made by Sukka` : 'foxact - Made by Sukka';
    const description = config.frontMatter.description ? config.frontMatter.description : 'React Hooks/Utils done right. For browser, SSR, and React Server Components. Made by Sukka (https://skk.moe)';

    const { route } = useRouter();
    const canonical = useMemo(() => new URL(withTrailingSlash(route), 'https://foxact.skk.moe').href, [route]);

    return {
      defaultTitle: 'foxact - Made by Sukka',
      title,
      description,
      canonical,
      openGraph: {
        url: canonical,
        title,
        siteName: 'foxact - React Hooks/Utils library made by Sukka',
        images: [
          {
            url: 'https://pic.skk.moe/gh/foxact-og.png',
            type: 'image/png',
            width: 1200,
            height: 675
          }
        ]
      },
      twitter: {
        cardType: 'summary_large_image'
      }
    };
  },
  footer: {
    text() {
      return (
        <>
          MIT License
          {' '}|{' '}
          Made with
          {' '}
          <span className="text-red-500 mx-1">♥</span>
          {' '}
          by
          {' '}
          <a href="https://skk.moe" className="mx-1 text-black dark:text-white underline underline-offset-2" target="_blank">Sukka</a>
          {' '}|{' '}
          <span className="mx-1">&copy;</span>
          {' '}
          <span>2023</span>
          {' '}
          <span className="mx-1">-</span>
          {' '}
          <CurrentYear defaultYear={2025} />
        </>
      );
    }
  }
};

export default config;
