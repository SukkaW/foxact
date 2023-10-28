const SIXTEEN_PX = '16px';

function scaleRem(remValue: string, shouldScaleTo: string) {
  return `calc(${remValue} * ${shouldScaleTo})`;
}

function createConverter(units: string, shouldScaleTo: string | null = null) {
  return (value: number | string) => {
    if (value === 0 || value === '0') {
      return '0';
    }

    if (typeof value === 'number') {
      const val = `${value / 16}${units}`;
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(val, shouldScaleTo) : val;
    }

    if (value.includes('calc(') || value.includes('var(')) {
      return value;
    }

    if (value.includes(units)) {
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(value, shouldScaleTo) : value;
    }

    const replaced = Number(value.replace('px', ''));
    // eslint-disable-next-line no-self-compare -- faster isNaN check
    if (replaced === replaced) {
      const val = `${replaced / 16}${units}`;
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(val, shouldScaleTo) : val;
    }

    return value;
  };
}

export const rem = createConverter('rem', SIXTEEN_PX);
export const mantine_rem = createConverter('rem', 'var(--mantine-scale)');
export const em = createConverter('em');
