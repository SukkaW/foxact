import 'client-only';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestIdleCallback, cancelIdleCallback } from '@/request-idle-callback';

type UseIntersectionObserverInit = Pick<IntersectionObserverInit, 'rootMargin' | 'root'>;

type UseIntersectionArgs = { disabled?: boolean } & UseIntersectionObserverInit & {
  rootRef?: React.RefObject<HTMLElement> | null
};
type ObserveCallback = (isVisible: boolean) => void;
interface Identifier {
  root: Element | Document | null,
  margin: string
}
interface Observer {
  id: Identifier,
  observer: IntersectionObserver,
  elements: Map<Element, ObserveCallback>
}

const hasIntersectionObserver = typeof IntersectionObserver === 'function';

export function useIntersection<T extends Element>({
  rootRef,
  rootMargin,
  disabled
}: UseIntersectionArgs): [(element: T | null) => void, boolean, () => void] {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (hasIntersectionObserver) {
      if (disabled || visible) return;

      const el = elementRef.current;
      if (el?.tagName) {
        return observe(
          el,
          (isVisible) => isVisible && setVisible(true),
          { root: rootRef?.current, rootMargin }
        );
      }
    }
    if (!visible) {
      const idleCallback = requestIdleCallback(() => setVisible(true));
      return () => cancelIdleCallback(idleCallback);
    }

  }, [disabled, rootMargin, rootRef, visible]);

  const resetVisible = useCallback(() => {
    setVisible(false);
  }, []);

  const setRef = useCallback((el: T | null) => {
    elementRef.current = el;
  }, []);

  return [setRef, visible, resetVisible];
}

const observers = new Map<Identifier, Observer>();
const idList: Identifier[] = [];

function observe(
  element: Element,
  callback: ObserveCallback,
  options: UseIntersectionObserverInit
): () => void {
  const { id, observer, elements } = createObserver(options);
  elements.set(element, callback);

  observer.observe(element);
  return function unobserve(): void {
    elements.delete(element);
    observer.unobserve(element);

    // Destroy observer when there's nothing left to watch:
    if (elements.size === 0) {
      observer.disconnect();
      observers.delete(id);
      const index = idList.findIndex(
        (obj) => obj.root === id.root && obj.margin === id.margin
      );
      if (index > -1) {
        idList.splice(index, 1);
      }
    }
  };
}

function createObserver(options: UseIntersectionObserverInit): Observer {
  const id = {
    root: options.root || null,
    margin: options.rootMargin || ''
  };
  const existing = idList.find(
    (obj) => obj.root === id.root && obj.margin === id.margin
  );
  let instance: Observer | undefined;

  if (existing) {
    instance = observers.get(existing);
    if (instance) {
      return instance;
    }
  }

  const elements = new Map<Element, ObserveCallback>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const callback = elements.get(entry.target);
      const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
      if (callback && isVisible) {
        callback(isVisible);
      }
    });
  }, options);

  instance = {
    id,
    observer,
    elements
  };

  idList.push(id);
  observers.set(id, instance);
  return instance;
}
