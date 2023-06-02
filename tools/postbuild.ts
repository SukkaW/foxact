import fse from 'fs-extra';
import path from 'path';
import { getEntries } from './get-entries';
import gzipSize from 'gzip-size';

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'dist');

interface GzipStats {
  total: { raw: number, gzip: number },
  exports: Record<string, { raw: number, gzip: number }>
}

(async () => {
  await Promise.all([
    fse.copyFile(
      path.resolve(rootDir, 'LICENSE'),
      path.resolve(distDir, 'LICENSE')
    ),
    fse.copyFile(
      path.resolve(rootDir, 'README.md'),
      path.resolve(distDir, 'README.md')
    ),
    fse.createFile(path.resolve(distDir, 'ts_version_4.8_and_above_is_required.d.ts'))
  ]);

  const packageJsonCopy = (
    await fse.readJson(path.resolve(rootDir, 'package.json'))
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- infer type from json file
  ) as Partial<typeof import('../package.json')> & { exports: any, typeVersions: any };

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

  const entries = await getEntries();

  const gzipSizeStat: GzipStats = {
    total: { raw: 0, gzip: 0 },
    exports: {}
  };

  await Promise.all(
    Object.keys(entries)
      // .filter(([_entryName, filename]) => filename.endsWith('.mjs'))
      .map(async (entryName) => {
        const filePath = path.join(distDir, entryName, 'index.mjs');

        const [fileSize, fileGzipSize] = await Promise.all([
          fse.stat(filePath).then(stat => stat.size),
          gzipSize.file(filePath, { level: 4 })
        ]);

        gzipSizeStat.total.raw += fileSize;
        gzipSizeStat.total.gzip += fileGzipSize;

        gzipSizeStat.exports[entryName] = {
          raw: fileSize,
          gzip: fileGzipSize
        };
      })
  );

  await fse.writeFile(
    path.resolve(distDir, 'sizes.json'),
    JSON.stringify(gzipSizeStat)
  );

  packageJsonCopy.exports = {
    './package.json': './package.json',
    './sizes.json': './sizes.json'
  };

  Object.keys(entries).forEach(entryName => {
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

  await fse.writeFile(
    path.resolve(distDir, 'package.json'),
    JSON.stringify(packageJsonCopy, null, 2)
  );
})();
