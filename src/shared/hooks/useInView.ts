"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const {
    rootMargin = "0px 0px -10% 0px",
    threshold = 0,
    triggerOnce = true,
  } = options;

  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            triggeredRef.current = true;
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce && !triggeredRef.current) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin, threshold, triggerOnce]);

  const setRef = useCallback((n: T | null) => {
    setNode(n);
  }, []);

  return [setRef, inView] as const;
}
