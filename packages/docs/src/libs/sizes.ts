const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
export function humanReadableSize(bytes: number) {
  let results = bytes;
  let i = 0;
  while (results >= 1024 && i < units.length) {
    results /= 1024;
    ++i;
  }
  return `${i === 0 ? results : results.toFixed(2)} ${units[i]}`;
}
