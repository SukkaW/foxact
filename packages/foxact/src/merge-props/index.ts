type PropsOf<T extends React.ElementType> = React.ComponentPropsWithRef<T>;
type InputProps<T extends React.ElementType> =
  | PropsOf<T>
  | ((otherProps: PropsOf<T>) => PropsOf<T>)
  | undefined;

const EMPTY_PROPS: PropsOf<any> = {};

/** @see https://foxact.skk.moe/merge-props */
export function mergeProps<T extends React.ElementType>(
  propsArray: Array<InputProps<T>>
): PropsOf<T>;
export function mergeProps<T extends React.ElementType>(
  ...props: Array<InputProps<T>>
): PropsOf<T>;
export function mergeProps(...args: any[]) {
  const items: any[] = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

  if (items.length === 0) {
    return EMPTY_PROPS;
  }

  let merged = createInitialMergedProps(items[0]);

  if (items.length === 1) {
    return merged;
  }

  for (let i = 1, len = items.length; i < len; i += 1) {
    if (items[i]) {
      merged = mergeInto(merged, items[i]);
    }
  }

  return merged;
}

function createInitialMergedProps<T extends React.ElementType>(inputProps: InputProps<T>) {
  if (isPropsGetter(inputProps)) {
    return { ...resolvePropsGetter(inputProps, EMPTY_PROPS) };
  }

  return { ...inputProps } as Record<string, any>;
}

function mergeInto<T extends React.ElementType>(merged: Record<string, any>, inputProps: InputProps<T>) {
  if (isPropsGetter(inputProps)) {
    return resolvePropsGetter(inputProps, merged as PropsOf<T>);
  }
  return mutablyMergeInto(merged, inputProps as PropsOf<T> | undefined);
}

function mutablyMergeInto<T extends React.ElementType>(
  mergedProps: Record<string, any>,
  externalProps: React.ComponentPropsWithRef<T> | undefined
) {
  if (!externalProps) {
    return mergedProps;
  }

  const keys = Object.keys(externalProps);
  for (let i = 0; i < keys.length; i++) {
    const propName = keys[i];
    const externalPropValue = (externalProps as Record<string, unknown>)[propName];

    switch (propName) {
      case 'style': {
        const a = mergedProps.style as React.CSSProperties | undefined;
        const b = externalPropValue as React.CSSProperties | undefined;
        if (a && !b) {
          mergedProps[propName] = a;
        } else if (!a && b) {
          mergedProps[propName] = b;
        } else if (a || b) {
          mergedProps[propName] = { ...a, ...b };
        }
        break;
      }
      case 'className': {
        mergedProps[propName] = mergeClassNames(
          mergedProps.className as string | undefined,
          externalPropValue as string | undefined
        );
        break;
      }
      default: {
        if (isEventHandler(propName, externalPropValue)) {
          mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue as (...args: unknown[]) => unknown);
        } else {
          mergedProps[propName] = externalPropValue;
        }
      }
    }
  }

  return mergedProps;
}

function isEventHandler(key: string, value: unknown) {
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return (
    code0 === 111 /* o */
    && code1 === 110 /* n */
    && code2 >= 65 /* A */
    && code2 <= 90 /* Z */
    && (typeof value === 'function' || typeof value === 'undefined')
  );
}

function isPropsGetter<T extends React.ComponentType>(
  inputProps: InputProps<T>
): inputProps is (props: PropsOf<T>) => PropsOf<T> {
  return typeof inputProps === 'function';
}

function resolvePropsGetter<T extends React.ElementType>(
  inputProps: InputProps<React.ElementType>,
  previousProps: PropsOf<T>
) {
  if (isPropsGetter(inputProps)) {
    return inputProps(previousProps);
  }

  return inputProps ?? (EMPTY_PROPS as PropsOf<T>);
}

function mergeEventHandlers(
  ourHandler: ((...args: unknown[]) => unknown) | undefined,
  theirHandler: ((...args: unknown[]) => unknown) | undefined
) {
  if (!theirHandler) {
    return ourHandler;
  }
  if (!ourHandler) {
    return theirHandler;
  }

  return (...args: unknown[]) => {
    const result = theirHandler(...args);
    ourHandler(...args);
    return result;
  };
}

function mergeClassNames(
  ourClassName: string | undefined,
  theirClassName: string | undefined
) {
  if (theirClassName) {
    if (ourClassName) {
      return theirClassName + ' ' + ourClassName;
    }

    return theirClassName;
  }

  return ourClassName;
}
