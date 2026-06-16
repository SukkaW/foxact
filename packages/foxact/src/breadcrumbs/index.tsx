import 'client-only';

import { createContext, isValidElement, useContext, useMemo } from 'react';
import { createMagicPortal } from '../magic-portal';

export interface BreadcrumbItemData<T = unknown> {
  title: string,
  href?: string,
  meta?: T
}

type BreadcrumbChain<T> = Array<BreadcrumbItemData<T>>;

export interface BreadcrumbItemProps<T = unknown> {
  title: string,
  href: string,
  meta?: T,
  children: React.ReactNode
}

export interface BreadcrumbPageProps<T = unknown> {
  title: string,
  meta?: T,
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- intentional, API shape
  children: ((items: Array<BreadcrumbItemData<T>>) => React.ReactNode) | React.ReactElement
}

export type BreadcrumbPortalTargetProps<E extends React.ElementType = 'div'> =
  Omit<React.ComponentPropsWithoutRef<E>, 'children' | 'ref'> & {
    as?: E | null,
    ssrFallback?: React.ReactNode | null
  };

/** @see https://foxact.skk.moe/breadcrumbs */
export function createBreadcrumbs<T = unknown>(name = '(Anonymous)'): [
  BreadcrumbProvider: React.ComponentType<React.PropsWithChildren>,
  BreadcrumbPortalTarget: <E extends React.ElementType = 'div'>(props: BreadcrumbPortalTargetProps<E>) => React.ReactNode,
  BreadcrumbItem: (props: BreadcrumbItemProps<T>) => React.ReactNode,
  BreadcrumbPage: (props: BreadcrumbPageProps<T>) => React.ReactNode | null,
  useBreadcrumbs: () => Array<BreadcrumbItemData<T>>
] {
  const ChainContext = createContext<BreadcrumbChain<T>>([]);

  const [
    PortalProvider,
    PortalTarget,
    PortalContent
  ] = createMagicPortal(name);

  function BreadcrumbItem({ title, href, meta, children }: BreadcrumbItemProps<T>) {
    const parentChain = useContext(ChainContext);
    const chain = useMemo(
      (): BreadcrumbChain<T> => [...parentChain, { title, href, meta }],
      [parentChain, title, href, meta]
    );

    return (
      <ChainContext.Provider value={chain}>
        {children}
      </ChainContext.Provider>
    );
  }

  function BreadcrumbPage(props: BreadcrumbPageProps<T>) {
    const { title, meta } = props;
    const parentChain = useContext(ChainContext);
    const fullChain = useMemo(
      (): BreadcrumbChain<T> => [...parentChain, { title, meta }],
      [parentChain, title, meta]
    );

    const { children } = props;
    const content = isValidElement(children) ? children : children(fullChain);

    return (
      <ChainContext.Provider value={fullChain}>
        <PortalContent>
          {content}
        </PortalContent>
      </ChainContext.Provider>
    );
  }

  function useBreadcrumbs(): BreadcrumbChain<T> {
    return useContext(ChainContext);
  }

  // function BreadcrumbProvider({ children }: React.PropsWithChildren) {
  //   return (
  //     <PortalProvider>
  //       {children}
  //     </PortalProvider>
  //   );
  // }

  return [
    PortalProvider, // BreadcrumbProvider,
    PortalTarget,
    BreadcrumbItem,
    BreadcrumbPage,
    useBreadcrumbs
  ];
}
