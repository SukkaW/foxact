import { forwardRef } from 'react';

export interface TypeScriptHappyForwardRef {
  // eslint-disable-next-line @typescript-eslint/ban-types -- fuck
  <T, P = {}>(
    render: (props: P, ref: React.ForwardedRef<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null
}

export const typeScriptHappyForwardRef = forwardRef as TypeScriptHappyForwardRef;
export const typescriptHappyForwardRef = forwardRef as TypeScriptHappyForwardRef;
