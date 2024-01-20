import 'client-only';
import type { LinkProps } from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { usePathname } from 'next/navigation'

export type ExtraProps = {
  isPending: boolean
}

export const useNextLinkProps = (props: LinkProps): LinkProps & ExtraProps => {
  const pathname = usePathname();
  const [targetPathname, setTargetPathname] = useState(() => pathname);
  useEffect(() => {
    setTargetPathname(pathname)
  }, [pathname])
  const onClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    setTargetPathname(new URL(event.currentTarget.href).pathname);
    return props.onClick?.(event);
  }, [props.onClick]);
  const isPending = targetPathname !== pathname;
  return useMemo(() => {
    return {
      ...props,
      onClick,
      isPending
    }
  }, [props, onClick, isPending])
}
