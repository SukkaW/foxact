import { defineConfig } from 'rollup';
import { swc, preserveUseDirective } from 'rollup-plugin-swc3';
import { dts } from 'rollup-plugin-dts';

import fse from 'fs-extra';

import pkgJson from './package.json';
import browserslist from 'browserslist';
import { getEntries } from './tools/get-entries';

const externalModules = Object.keys(pkgJson.dependencies)
  .concat(Object.keys(pkgJson.peerDependencies))
  .concat([
    'react-router-dom',
    'next'
  ]);
const external = (id: string) => {
  return externalModules.some((name) => id === name || id.startsWith(`${name}/`));
};

// Same target as Next.js 13
const targets = browserslist([
  'chrome 64',
  'edge 79',
  'firefox 67',
  'opera 51',
  'safari 12'
]);

export default async function () {
  await fse.rm('dist', { recursive: true, force: true });

  const input = await getEntries();

  return defineConfig([{
    input,
    output: [{
      dir: 'dist',
      format: 'commonjs',
      entryFileNames: '[name]/index.cjs'
    }, {
      dir: 'dist',
      format: 'commonjs',
      entryFileNames: '[name]/index.js'
    }, {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name]/index.mjs'
    }],
    plugins: [
      swc({
        isModule: true,
        jsc: {
          target: undefined,
          transform: {
            react: {
              runtime: 'automatic'
            }
          },
          minify: {
            compress: {
              passes: 2,
              const_to_let: false
            },
            mangle: {},
            module: true
          }
        },
        minify: true,
        env: {
          targets
        }
      }),
      preserveUseDirective()
    ],
    external,
    cache: true
  }, {
    input,
    output: {
      dir: 'dist',
      format: 'commonjs',
      entryFileNames: '[name]/index.d.ts'
    },
    plugins: [dts()]
  }]);
}
