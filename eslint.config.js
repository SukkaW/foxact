'use strict';

const { withFiles } = require('@eslint-sukka/shared');

module.exports = require('eslint-config-sukka').sukka({
  ignores: {
    customGlobs: ['dist/**/*', 'docs/**/*', ...require('eslint-config-sukka').constants.GLOB_EXCLUDE]
  },
  react: {
    nextjs: [
      'packages/docs/app/**/*.{ts,tsx}'
    ]
  }
}, {
  rules: {
    'paths/alias': 'off',
    '@eslint-react/no-use-context': 'off',
    '@eslint-react/no-context-provider': 'off'
  }
}, {
  // next.js/nextra naming convention
  files: [
    '**/app/**/_*.cjs',
    String.raw`**/app/**/\[*.?([cm])[j]s?(x)`,
    '**/pages/_app.?([cm])[jt]s?(x)',
    '**/pages/document.?([cm])[jt]s?(x)'
  ],
  rules: {
    '@eslint-react/naming-convention/filename': 'off'
  }
},
// https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
withFiles(
  {
    ...require('eslint-plugin-testing-library').configs['flat/react'],
    settings: {
      // only treat the real RTL render as a render util, NOT renderToString
      // from react-dom/server (the default heuristic matches any render*)
      'testing-library/custom-renders': 'off'
    }
  },
  ['packages/foxact/src/**/*.test.{ts,tsx}', 'packages/foxact/test/**/*.{ts,tsx}']
));
