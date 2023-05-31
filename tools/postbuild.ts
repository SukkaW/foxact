import fse from 'fs-extra';
import path from 'path';
import { getEntries } from './get-entries';

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'dist');

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
  packageJsonCopy.exports = {
    './package.json': './package.json'
  };

  const entries = await getEntries();

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
