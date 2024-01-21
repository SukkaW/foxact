import 'client-only';

import type { UrlObject } from 'url';
import type { LinkProps } from 'next/link';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { formatUrl } from 'next/dist/shared/lib/router/utils/format-url';
import { useIntersection } from '../use-intersection';
import { noop } from '@/noop';

export interface UseNextLinkOptions extends Omit<LinkProps,
  | 'as' // Next.js App Router doesn't encourage to use `as` prop (it is only retained for the legacy puprpose)
  | 'href' // `href` is passed in as a separate argument (for easier usage)
  | 'legacyBehavior' // Dropping `legacyBehavior` prop can simplify things a lot
  | 'shallow' // `shallow` is only for Next.js Pages Router
  | 'passHref' // Also `legacyBehavior`
  | 'locale' // For Next.js Pages Router's built-in i18n only, Next.js App Router doesn't implement i18n yet
> {
  ref?: React.RefObject<HTMLAnchorElement> | React.RefCallback<HTMLAnchorElement> | null
}

export interface UseNextLinkReturnProps extends Partial<JSX.IntrinsicElements['a']> {
  ref: React.RefCallback<HTMLAnchorElement>,
  onTouchStart: React.TouchEventHandler<HTMLAnchorElement>,
  onMouseEnter: React.MouseEventHandler<HTMLAnchorElement>,
  onClick: React.MouseEventHandler<HTMLAnchorElement>,
  href?: string
}

const isModifiedEvent = (event: React.MouseEvent) => {
  const eventTarget = event.target as HTMLElement;
  const target = eventTarget.getAttribute('target');
  return (
    (target && target !== '_self')
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey // triggers resource download
    || (event.nativeEvent && event.nativeEvent.which === 2)
  );
};

export const useNextLink = (
  hrefProp: string | UrlObject,
  {
    prefetch = true,
    ref,
    onClick,
    onMouseEnter,
    onTouchStart,
    scroll: routerScroll = true,
    replace = false,
    ...restProps // Record<string, never>
  }: UseNextLinkOptions
): [isPending: boolean, linkProps: UseNextLinkReturnProps] => {
  // Type guard to make sure there is no more props left in restProps
  if (process.env.NODE_ENV === 'development') {
    const _: Record<string, never> = restProps;
  }

  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [setIntersectionRef, isVisible, resetVisible] = useIntersection({
    rootMargin: '200px'
  });

  const resolvedHref = useMemo(() => (typeof hrefProp === 'string' ? hrefProp : formatUrl(hrefProp)), [hrefProp]);
  const [previousResolvedHref, setPreviousResolvedHref] = useState<string>(resolvedHref);

  if (previousResolvedHref !== resolvedHref) {
    // It is safe to set the state during render, as long as it won't trigger an infinite render loop.
    // React will render the component with the current state, then throws away the render result
    // and immediately re-executes the component function with the updated state.
    setPreviousResolvedHref(resolvedHref);
    resetVisible();
  }

  const callbackRef: React.RefCallback<HTMLAnchorElement> = useCallback((el: HTMLAnchorElement | null) => {
    // track the element visibility
    setIntersectionRef(el);

    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && el) {
      // We are acting on React behalf to assign the passed-in ref
      (ref as React.MutableRefObject<HTMLAnchorElement>).current = el;
    }
  }, [ref, setIntersectionRef]);

  const childProps: UseNextLinkReturnProps = {
    ref: callbackRef,
    onClick(e) {
      if (typeof onClick === 'function') {
        onClick(e);
      }
      if (e.defaultPrevented) {
        return;
      }

      const { nodeName } = e.currentTarget;
      // anchors inside an svg have a lowercase nodeName
      if (
        nodeName.toUpperCase() === 'A'
        && isModifiedEvent(e)
      ) {
        // app-router supports external urls out of the box
        // ignore click for browser’s default behavior
        return;
      }

      e.preventDefault();

      startTransition(() => {
        router[replace ? 'replace' : 'push'](resolvedHref, { scroll: routerScroll });
      });
    },
    onMouseEnter(e) {
      if (typeof onMouseEnter === 'function') {
        onMouseEnter(e);
      }
      // Always disable prefetching during the development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      if (!prefetch) {
        return;
      }

      // TODO-SUKKA: bring up prefetch
      noop(e);
    },
    onTouchStart(e) {
      if (typeof onTouchStart === 'function') {
        onTouchStart(e);
      }
      // Always disable prefetching during the development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      if (!prefetch) {
        return;
      }

      // TODO-SUKKA: bring up prefetch
      noop(e);
    },
    ...restProps
  };

  return [
    isPending,
    childProps
  ] as const;
};
