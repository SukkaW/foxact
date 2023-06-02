const { resolve } = require('path');
const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  root: true,
  extends: ['plugin:@next/next/recommended'],
  overrides: [
    {
      files: [
        '.eslintrc.js',
        'next.config.js',
        'postcss.config.js'
      ],
      extends: 'sukka/node',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    {
      files: [
        '**/*.ts',
        '**/*.tsx'
      ],
      extends: [
        'sukka/react',
        'sukka/typescript'
      ],
      parserOptions: {
        project
      }
    },
    {
      files: [
        '**/*.mdx'
      ],
      extends: [
        'plugin:mdx/recommended'
      ]
    }
  ]
};
