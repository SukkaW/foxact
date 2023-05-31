import { defineConfig } from 'rollup';
import { swc } from 'rollup-plugin-swc3';
import dtsExports from 'rollup-plugin-dts';

import pkgJson from './package.json';
import browserslist from 'browserslist';
import { entries as input } from './src/entries';

// @ts-expect-error -- rollup-plugin-dts has incorrect types
const dts = dtsExports.default as typeof dtsExports;

const externalModules = Object.keys(pkgJson.dependencies)
  .concat(Object.keys(pkgJson.peerDependencies));
const external = (id: string) => {
  return externalModules.some((name) => id === name || id.startsWith(`${name}/`));
};

const targets = browserslist([
  'chrome 64',
  'edge 79',
  'firefox 67',
  'opera 51',
  'safari 12'
]);

let cache;

export default defineConfig([{
  input,
  output: [{
    dir: 'dist',
    format: 'commonjs',
    entryFileNames: '[name].cjs'
  }, {
    dir: 'dist',
    format: 'commonjs',
    entryFileNames: '[name].js'
  }, {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].mjs'
  }],
  plugins: [
    swc({
      jsc: {
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      },
      env: {
        targets
      }
    })
  ],
  external,
  cache
}, {
  input,
  output: {
    dir: 'dist',
    format: 'commonjs',
    entryFileNames: '[name].d.ts'
  },
  plugins: [dts()]
}]);
