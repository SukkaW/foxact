import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { humanReadableSize } from '../libs/sizes';

interface ExportsStats {
  total: { raw: number, gzip: number },
  exports: Record<string, { raw: number, gzip: number, br: number }>
}

export function useLatestExportsSizes() {
  return useSWRImmutable<ExportsStats>(
    'https://unpkg.com/foxact@latest/sizes.json',
    () => {
      const controller = typeof AbortController === 'undefined' ? null : new AbortController();
      const signal = controller?.signal;

      const responseToJson = async (response: Response) => {
        const json = await response.json();
        controller?.abort();
        return json as ExportsStats;
      };

      return Promise.any([
        fetch('https://unpkg.com/foxact@latest/sizes.json', { signal }).then(responseToJson),
        // fetch('https://cdn.jsdelivr.net/npm/foxact@latest/sizes.json', { signal }).then(responseToJson),
        // fetch('https://fastly.jsdelivr.net/npm/foxact@latest/sizes.json', { signal }).then(responseToJson),
        fetch('https://esm.sh/foxact@latest/sizes.json', { signal }).then(responseToJson),
        fetch('https://cdn.skypack.dev/foxact@latest/sizes.json', { signal }).then(responseToJson)
      ]);
    }
  );
}

export function useLatestTotalExportsSize() {
  const { data } = useLatestExportsSizes();
  return useMemo(() => {
    if (!data) return 'about 5 KiB';
    return humanReadableSize(data.total.gzip);
  }, [data]);
}
