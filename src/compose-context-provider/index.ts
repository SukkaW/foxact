import { cloneElement, memo } from 'react';

export interface ContextComposeProviderProps extends React.PropsWithChildren {
  // eslint-disable-next-line @typescript-eslint/ban-types -- cloneElement
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
