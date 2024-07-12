import { cloneElement, memo } from 'react';
import type { Foxact } from '../types';

export interface ContextComposeProviderProps extends Foxact.PropsWithChildren {
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- cloneElement
  contexts: React.ReactElement[]
}

/** @see https://foxact.skk.moe/compose-context-provider */
export const ComposeContextProvider = memo(({
  contexts,
  children
}: ContextComposeProviderProps) => contexts.reduceRight<React.ReactNode>(
  (children: React.ReactNode, parent) => cloneElement(
    parent,
    { children }
  ),
  children
));
