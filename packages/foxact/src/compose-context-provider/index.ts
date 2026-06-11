import { cloneElement, memo } from 'react';

export interface ContextComposeProviderProps extends React.PropsWithChildren {
  /** Only elements that accept a `children` prop (e.g. context providers) can be composed */
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- cloneElement
  contexts: Array<React.ReactElement<React.PropsWithChildren>>
}

/** @see https://foxact.skk.moe/compose-context-provider */
export const ComposeContextProvider = memo(({
  contexts,
  children
}: ContextComposeProviderProps) => contexts.reduceRight<React.ReactNode>(
  // eslint-disable-next-line @eslint-react/no-clone-element -- Composing elements based on props
  (children: React.ReactNode, parent) => cloneElement(
    parent,
    { children }
  ),
  children
));
