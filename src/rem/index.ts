const SIXTEEN_PX = '16px';

function scaleRem(remValue: string, shouldScaleTo: string) {
  return `calc(${remValue} * ${shouldScaleTo})`;
}

export function createConverter(units: string, shouldScaleTo: '16px' | (string & {}) | null = null, htmlFontSize = 16) {
  return function converter(this: void, value: number | string | number[]): string {
    if (Array.isArray(value)) {
      return value.map(converter).join(' ');
    }

    if (value === 0 || value === '0') {
      return '0';
    }

    if (typeof value === 'number') {
      const val = `${value / htmlFontSize}${units}`;
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(val, shouldScaleTo) : val;
    }

    if (value.includes('calc(') || value.includes('var(') || value.includes('clamp(')) {
      return value;
    }

    if (value.includes(' ')) {
      return value
        .split(' ')
        .map(converter)
        .join(' ');
    }

    if (value.includes(units)) {
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(value, shouldScaleTo) : value;
    }

    const replaced = Number(value.replace('px', ''));
    // Replaced is not NaN
    if (replaced === replaced) {
      const val = `${replaced / htmlFontSize}${units}`;
      return (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) ? scaleRem(val, shouldScaleTo) : val;
    }

    return value;
  };
}

export const rem = createConverter('rem', SIXTEEN_PX, 16);
export const mantine_rem = createConverter('rem', 'var(--mantine-scale)', 16);
export const em = createConverter('em', SIXTEEN_PX, 16);
