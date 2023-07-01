import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { humanReadableSize } from '../libs/sizes';

interface ExportsStats {
  total: { raw: number, gzip: number },
  exports: Record<string, { raw: number, gzip: number, br: number }>
}

export const useLatestExportsSizes = () => {
  return useSWRImmutable<ExportsStats>(
    'https://unpkg.com/foxact@latest/sizes.json',
    () => {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const signal = controller?.signal;

      const responseToJson = async (response: Response) => {
        const json = await response.json();
        controller?.abort();
        return json;
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
};

export const useLatestTotalExportsSize = () => {
  const { data } = useLatestExportsSizes();
  return useMemo(() => {
    if (!data) return 'less than 5 KiB';
    return humanReadableSize(data.total.gzip);
  }, [data]);
};
