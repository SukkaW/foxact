import { useRouter } from 'next/router';
import { useLatestExportsSizes } from '../hooks/use-latest-exports-sizes';
import { useMemo } from 'react';

const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
const humanReadableSize = (bytes: number) => {
  let results = bytes;
  let i = 0;
  while (bytes >= 1024 && i < units.length) {
    results /= 1024;
    ++i;
  }
  return `${i === 0 ? results : results.toFixed(2)} ${units[i]}`;
};

export default function ExportMetaInfo() {
  const { data } = useLatestExportsSizes();
  const _slug = useRouter().asPath.split(/[?#]/)[0];
  const slug = _slug.startsWith('/') ? _slug.slice(1) : _slug;

  const [humanReadableRawSize, humanReadableGzipSize] = useMemo(() => {
    if (!data) return ['loading...', 'loading...'];
    if (!(slug in data.exports)) {
      return ['N/A', 'N/A'];
    }
    return [humanReadableSize(data.exports[slug].raw), humanReadableSize(data.exports[slug].gzip)];
  }, [data, slug]);

  return (
    <div className="grid grid-cols-[100px_auto] gap-2 text-sm mt-4 mb-8 items-start">
      <div className="font-semibold">Exports Size</div>
      <div>{humanReadableRawSize}</div>
      <div className="font-semibold">Gzip Size</div>
      <div>{humanReadableGzipSize}</div>
    </div>
  );
}
