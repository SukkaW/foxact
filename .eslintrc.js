const { resolve } = require('path');
const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  root: true,
  overrides: [
    {
      files: [
        '.eslintrc.js'
      ],
      extends: 'sukka/node',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    {
      files: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'rollup.config.ts',
        'tools/**/*.ts'
      ],
      extends: ['sukka/react', 'sukka/typescript'],
      parserOptions: {
        project
      },
      rules: {
        '@fluffyfox/prefer-timer-id': 'off'
      },
      settings: {
        react: {
          version: '18.2.0'
        }
      }
    }
  ],
  ignorePatterns: [
    'dist/**/*',
    'docs/**/*'
  ]
};
