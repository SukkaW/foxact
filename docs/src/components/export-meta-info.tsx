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
    <div className="grid grid-cols-[128px_auto] gap-2 text-sm mt-4 mb-8 items-start">
      <div className="font-bold">Exports Size</div>
      <div>{humanReadableRawSize}</div>
      <div className="font-bold">Gzip Size</div>
      <div>{humanReadableGzipSize}</div>
      <div className="font-bold">Source Code</div>
      <a
        href={`https://github.com/SukkaW/foxact/tree/master/src/${slug}/`}
        className="underline underline-offset-1"
      >
        View on GitHub
      </a>
      <div className="font-bold">Docs</div>
      <a
        href={`https://github.com/SukkaW/foxact/blob/master/docs/src/pages/${slug}.mdx`}
        className="underline underline-offset-1"
      >
        Edit this page
      </a>
    </div>
  );
}
