'use strict';

module.exports = require('eslint-config-sukka').sukka({
  ignores: {
    customGlobs: ['dist/**/*', 'docs/**/*', ...require('eslint-config-sukka').constants.GLOB_EXCLUDE]
  },
  react: {
    nextjs: false
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
});
