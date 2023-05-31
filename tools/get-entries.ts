import listDir from '@sukka/listdir';
import path from 'path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

export const getEntries = async () => {
  const files = (await listDir(srcDir));

  return files.reduce<Record<string, string>>((prev, cur) => {
    const entryName = path.basename(cur, path.extname(cur));
    const dir = path.dirname(cur);

    if (entryName === 'index') {
      prev[dir] = path.join('src', cur);
    }
    return prev;
  }, {});
};
