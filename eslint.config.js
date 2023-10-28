'use strict';

const { resolve } = require('path');
const tsconfigPath = resolve(__dirname, 'tsconfig.json');

module.exports = require('eslint-config-sukka').sukka({
  ignores: {
    customGlobs: ['dist/**/*', 'docs/**/*', ...require('eslint-config-sukka').constants.GLOB_EXCLUDE]
  },
  ts: {
    tsconfigPath
  }
});
