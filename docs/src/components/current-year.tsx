import { useEffect, useState } from 'react';

export default function CurrentYear(props: { defaultYear: number }) {
  const [year, setYear] = useState<number>(props.defaultYear);
  useEffect(() => {
    // eslint-disable-next-line @fluffyfox/no-unsafe-date -- no i18n
    setYear(new Date().getFullYear());
  }, []);
  return <span>{year}</span>;
}
