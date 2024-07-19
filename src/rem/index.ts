const SIXTEEN_PX = '16px';

const scaleRem = (remValue: string, shouldScaleTo: '16px' | (string & {}) | null = null) => {
  if (shouldScaleTo && shouldScaleTo !== SIXTEEN_PX) {
    return `calc(${remValue} * ${shouldScaleTo})`;
  }
  return remValue;
};

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
      return scaleRem(val, shouldScaleTo);
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
      return scaleRem(value, shouldScaleTo);
    }

    const replaced = Number(value.replace('px', ''));
    // Replaced is not NaN
    if (replaced === replaced) {
      const val = `${replaced / htmlFontSize}${units}`;
      return scaleRem(val, shouldScaleTo);
    }

    return value;
  };
}

export const rem = createConverter('rem', SIXTEEN_PX, 16);
export const mantine_rem = createConverter('rem', 'var(--mantine-scale)', 16);
export const em = createConverter('em', SIXTEEN_PX, 16);
