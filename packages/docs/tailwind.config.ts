import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx,md}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
