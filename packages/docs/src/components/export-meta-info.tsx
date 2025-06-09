import { useRouter } from 'next/router';
import { useLatestExportsSizes } from '../hooks/use-latest-exports-sizes';
import { useMemo } from 'react';
import { humanReadableSize } from '../libs/sizes';
import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo';

interface ExportMetaInfoProps {
  slug?: string
}

export default function ExportMetaInfo({ slug: _slug }: ExportMetaInfoProps) {
  const { data } = useLatestExportsSizes();
  const router = useRouter();

  const _ = (_slug || router.asPath.split(/[#?]/)[0]);
  const slug = withoutTrailingSlash(withoutLeadingSlash(_));

  const [humanReadableRawSize, humanReadableGzipSize, humanReadableBrotliSize] = useMemo(() => {
    if (!data) return ['loading...', 'loading...'];
    if (!(slug in data.exports)) {
      return ['N/A', 'N/A', 'N/A'];
    }
    return [
      humanReadableSize(data.exports[slug].raw),
      humanReadableSize(data.exports[slug].gzip),
      humanReadableSize(data.exports[slug].br)
    ];
  }, [data, slug]);

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-800 py-4 px-6 shadow-md mt-4 mb-8 max-w-md">
      <div className="grid grid-cols-[96px_auto] md:grid-cols-[128px_auto] gap-2 text-sm items-start">
        <div className="font-bold">Exports Size</div>
        <div>{humanReadableRawSize}</div>
        <div className="font-bold">Gzip Size</div>
        <div>{humanReadableGzipSize}</div>
        <div className="font-bold">Brotli Size</div>
        <div>{humanReadableBrotliSize}</div>
        <div className="font-bold">Source Code</div>
        <a
          href={`https://github.com/SukkaW/foxact/blob/master/packages/foxact/src/${slug}/`}
          className="underline underline-offset-1"
          target="_blank"
          rel="noopener noreferrer"
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
    </div>
  );
}
