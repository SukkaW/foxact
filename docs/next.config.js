const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
});

module.exports = withNextra(/** @type {import('next').NextConfig} */({
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
}));
