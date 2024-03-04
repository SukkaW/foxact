import 'client-only';

import type { LinkProps } from 'next/link';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { formatUrl } from 'next/dist/shared/lib/router/utils/format-url';
import { useIntersection } from '../use-intersection';

import type {
  PrefetchOptions as AppRouterPrefetchOptions
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';

interface UrlObject {
  auth?: string | null | undefined,
  hash?: string | null | undefined,
  host?: string | null | undefined,
  hostname?: string | null | undefined,
  href?: string | null | undefined,
  pathname?: string | null | undefined,
  protocol?: string | null | undefined,
  search?: string | null | undefined,
  slashes?: boolean | null | undefined,
  port?: string | number | null | undefined,
  query?: any
}

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

const isModifiedEvent = (event: React.MouseEvent<HTMLAnchorElement>) => {
  const eventTarget = event.currentTarget;
  const target = eventTarget.getAttribute('target');
  return (
    (target && target !== '_self')
    || eventTarget.download
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey // triggers resource download
    || (event.nativeEvent && event.nativeEvent.which === 2)
  );
};

// https://github.com/vercel/next.js/blob/39589ff35003ba73f92b7f7b349b3fdd3458819f/packages/next/src/client/components/router-reducer/router-reducer-types.ts#L148
const PREFETCH_APPROUTER_AUTO = 'auto';
const PREFETCH_APPROUTER_FULL = 'full';

const prefetch = (
  router: ReturnType<typeof useRouter>,
  href: string,
  options: AppRouterPrefetchOptions
) => {
  if (typeof window === 'undefined') {
    return;
  }

  // Prefetch the RSC if asked (only in the client)
  // We need to handle a prefetch error here since we may be
  // loading with priority which can reject but we don't
  // want to force navigation since this is only a prefetch
  Promise.resolve(router.prefetch(href, options)).catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      // rethrow to show invalid URL errors
      throw err;
    }
  });
};

/** @see https://foxact.skk.moe/use-next-link */
const useNextLink = (
  hrefProp: string | UrlObject,
  {
    prefetch: prefetchProp,
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

  /**
    * The possible states for prefetch are:
    * - null: this is the default "auto" mode, where we will prefetch partially if the link is in the viewport
    * - true: we will prefetch if the link is visible and prefetch the full page, not just partially
    * - false: we will not prefetch if in the viewport at all
    */
  const appPrefetchKind = prefetchProp == null ? PREFETCH_APPROUTER_AUTO : PREFETCH_APPROUTER_FULL;
  const prefetchEnabled = prefetchProp !== false;

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

  // Prefetch the URL if we haven't already and it's visible.
  useEffect(() => {
    // in dev, we only prefetch on hover to avoid wasting resources as the prefetch will trigger compiling the page.
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // If we don't need to prefetch the URL, don't do prefetch.
    if (!isVisible || !prefetchEnabled) {
      return;
    }

    // Prefetch the URL.
    prefetch(
      router,
      resolvedHref,
      {
        kind: appPrefetchKind as PrefetchKind
      }
    );
  }, [appPrefetchKind, isVisible, prefetchEnabled, resolvedHref, router]);

  const childProps: UseNextLinkReturnProps = {
    ref: useCallback<React.RefCallback<HTMLAnchorElement>>((el: HTMLAnchorElement | null) => {
      // track the element visibility
      setIntersectionRef(el);

      if (typeof ref === 'function') {
        ref(el);
      } else if (ref && el) {
        // We are acting on React behalf to assign the passed-in ref
        (ref as React.MutableRefObject<HTMLAnchorElement>).current = el;
      }
    }, [ref, setIntersectionRef]),
    onClick: useCallback((e) => {
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
    }, [onClick, replace, resolvedHref, router, routerScroll]),
    onMouseEnter: useCallback((e) => {
      if (typeof onMouseEnter === 'function') {
        onMouseEnter(e);
      }
      // Always disable prefetching during the development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      if (!prefetchEnabled) {
        return;
      }

      // Prefetch the URL.
      prefetch(
        router,
        resolvedHref,
        {
          kind: appPrefetchKind as PrefetchKind
        }
      );
    }, [appPrefetchKind, onMouseEnter, prefetchEnabled, resolvedHref, router]),
    onTouchStart: useCallback((e) => {
      if (typeof onTouchStart === 'function') {
        onTouchStart(e);
      }
      // Always disable prefetching during the development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      if (!prefetchEnabled) {
        return;
      }

      // Prefetch the URL.
      prefetch(
        router,
        resolvedHref,
        {
          kind: appPrefetchKind as PrefetchKind
        }
      );
    }, [appPrefetchKind, onTouchStart, prefetchEnabled, resolvedHref, router]),
    ...restProps
  };

  return [
    isPending,
    childProps
  ] as const;
};

export const unstable_useNextLink = useNextLink;
