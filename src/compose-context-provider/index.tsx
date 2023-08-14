import { cloneElement } from 'react';

export interface ContextComposeProviderProps extends React.PropsWithChildren {
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
