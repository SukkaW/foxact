import 'client-only';

import { createPortal } from 'react-dom';
import { createContextState } from '../context-state';

export type MagicPortalTargetProps<T extends React.ElementType = 'div'> = Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'ref'> & {
  as?: T | null
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

  function PortalTarget<T extends React.ElementType = 'div'>({ as, ...props }: MagicPortalTargetProps<T>) {
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

  return [
    PortalProvider,
    PortalTarget,
    PortalContent
  ];
}
