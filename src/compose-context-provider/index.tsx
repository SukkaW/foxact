import { cloneElement } from 'react';

export interface ContextComposeProviderProps extends React.PropsWithChildren {
  // eslint-disable-next-line @typescript-eslint/ban-types -- cloneElement
  contexts: React.ReactElement[]
}

export const ComposeContextProvider = ({
  contexts,
  children
}: ContextComposeProviderProps) => contexts.reduceRight<React.ReactNode>(
  (children: React.ReactNode, parent) => cloneElement(
    parent,
    { children }
  ),
  children
);
