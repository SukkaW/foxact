import { useRouter } from 'next/router';
import { useLatestExportsSizes } from '../hooks/use-latest-exports-sizes';
import { useMemo } from 'react';
import { humanReadableSize } from '../libs/sizes';

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
      <div>Source Code</div>
      <a
        href={`https://github.com/SukkaW/foxact/tree/master/src/${slug}/`}
        className="underline underline-offset-1"
      >
        View on GitHub
      </a>
    </div>
  );
}
