import 'client-only';

import { createPortal } from 'react-dom';
import { createContextState } from '../context-state';
import { noSSR } from '../no-ssr';
import { Suspense } from 'react';

export type MagicPortalTargetProps<T extends React.ElementType = 'div'> = Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'ref'> & {
  as?: T | null,
  /**
   * MagicPortal do not support server-side rendering. By default, it will render nothing on the server.
   *
   * However, you can use `ssrFallback` to emit a fallback (e.g. skeleton) into server-rendered HTML.
   */
  ssrFallback?: React.ReactNode | null
};

/** @see https://foxact.skk.moe/magic-portal */
export function createMagicPortal(name = '(Anoymous)'): [
  PortalProvider: React.ComponentType<React.PropsWithChildren>,
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- strict types purpose
  PortalTarget: <T extends React.ElementType = 'div'>(props: MagicPortalTargetProps<T>) => React.ReactElement,
  PortalContent: (props: React.PropsWithChildren) => React.ReactPortal | null
] {
  const [
    PortalTargetDOMNodeProvider,
    usePortalTargetDOMNode,
    useSetPortalTargetDOMNode
  ] = createContextState<HTMLElement | null>(null);

  function InnerPortalTarget<T extends React.ElementType = 'div'>({ as, ssrFallback = null, ...props }: MagicPortalTargetProps<T>) {
    if (ssrFallback != null) {
      noSSR();
    }

    const Component = as || 'div';
    const setTargetDOMNode = useSetPortalTargetDOMNode();
    return (
      <Component
        {...(
          name
            ? { 'data-foxact-magic-portal-target': name }
            : {}
        )}
        ref={setTargetDOMNode}
        {...props}
      />
    );
  }

  function PortalTarget<T extends React.ElementType = 'div'>(props: MagicPortalTargetProps<T>) {
    const { ssrFallback = null } = props;
    if (ssrFallback != null) {
      // ssr fallback mode
      return (
        <Suspense fallback={ssrFallback}>
          <InnerPortalTarget {...props} />
        </Suspense>
      );
    }

    return <InnerPortalTarget {...props} />;
  }

  if (process.env.NODE_ENV !== 'production') {
    PortalTarget.displayName = name + '.PortalTarget';
  }

  function PortalContent({ children }: React.PropsWithChildren) {
    const targetDOMNode = usePortalTargetDOMNode();

    if (typeof window === 'undefined') return null;
    if (!targetDOMNode) return null;

    return createPortal(children, targetDOMNode);
  }

  if (process.env.NODE_ENV !== 'production') {
    PortalContent.displayName = name + '.PortalContent';
  }

  function PortalProvider({ children }: React.PropsWithChildren) {
    return (
      <PortalTargetDOMNodeProvider>
        {children}
      </PortalTargetDOMNodeProvider>
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    PortalProvider.displayName = name + '.PortalProvider';
  }

  return [
    PortalProvider,
    PortalTarget,
    PortalContent
  ];
}
