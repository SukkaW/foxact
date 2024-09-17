import fsp from 'node:fs/promises';
import path from 'node:path';
import { getEntries } from './get-entries';
import gzipSize from 'gzip-size';
import { file as brotliSizeFile } from 'brotli-size';

import zlib from 'node:zlib';

import type { PackageJson } from '@package-json/types';

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'dist');

interface GzipStats {
  total: { raw: number, gzip: number, br: number },
  exports: Record<string, { raw: number, gzip: number, br: number }>
}

const copyAndCreateFiles = () => {
  return Promise.all([
    fsp.copyFile(
      path.resolve(rootDir, 'LICENSE'),
      path.resolve(distDir, 'LICENSE')
    ),
    fsp.copyFile(
      path.resolve(rootDir, 'README.md'),
      path.resolve(distDir, 'README.md')
    ),
    fsp.writeFile(path.resolve(distDir, 'ts_version_4.8_and_above_is_required.d.ts'), '')
  ]);
};

const createPackageJson = async (entries: Record<string, string>) => {
  const packageJsonCopy = JSON.parse(
    await fsp.readFile(path.resolve(rootDir, 'package.json'), 'utf-8')
  ) as PackageJson;

  delete packageJsonCopy.devDependencies;
  delete packageJsonCopy.private;
  delete packageJsonCopy.scripts;

  packageJsonCopy.typeVersions = {
    '>=4.8': {
      '*': ['*']
    },
    '*': {
      '*': ['ts_version_4.8_and_above_is_required.d.ts']
    }
  };

  packageJsonCopy.exports = {
    './package.json': './package.json',
    './sizes.json': './sizes.json'
  };

  Object.keys(entries).forEach(entryName => {
    // This is an unnecessary check to make TypeScript happy
    // For some reason TypeScript ignores the assignment above
    packageJsonCopy.exports ??= {};

    packageJsonCopy.exports[`./${entryName}`] = {
      types: `./${entryName}/index.d.ts`,
      import: {
        types: `./${entryName}/index.d.ts`,
        default: `./${entryName}/index.mjs`
      },
      require: `./${entryName}/index.cjs`,
      default: `./${entryName}/index.js`
    };
  });

  await fsp.writeFile(
    path.resolve(distDir, 'package.json'),
    JSON.stringify(packageJsonCopy, null, 2)
  );
};

const createSizesJson = async (entries: Record<string, string>) => {
  const gzipSizeStat: GzipStats = {
    total: { raw: 0, gzip: 0, br: 0 },
    exports: {}
  };

  await Promise.all(
    Object.keys(entries)
      // .filter(([_entryName, filename]) => filename.endsWith('.mjs'))
      .map(async (entryName) => {
        const filePath = path.join(distDir, entryName, 'index.mjs');

        const [fileSize, fileGzipSize, fileBrotliSize] = await Promise.all([
          fsp.stat(filePath).then(stat => stat.size),
          // Cloudflare uses gzip level 8 and brotli level 4 as default
          // https://blog.cloudflare.com/this-is-brotli-from-origin/
          gzipSize.file(filePath, { level: 8 }),
          brotliSizeFile(filePath, {
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4
          })
        ]);

        gzipSizeStat.total.raw += fileSize;
        gzipSizeStat.total.gzip += fileGzipSize;

        gzipSizeStat.exports[entryName] = {
          raw: fileSize,
          gzip: fileGzipSize,
          br: fileBrotliSize
        };
      })
  );

  await fsp.writeFile(
    path.resolve(distDir, 'sizes.json'),
    JSON.stringify(gzipSizeStat)
  );
};

(async () => {
  const entriesPromise = getEntries();

  await Promise.all([
    copyAndCreateFiles(),
    createPackageJson(await entriesPromise),
    createSizesJson(await entriesPromise)
  ]);
})();
