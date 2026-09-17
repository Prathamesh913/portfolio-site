// One-shot viewport trigger for the Tier 1 object entrance moments
// (CRT power-on, split-flap month labels). The animation plays the first time
// the element is seen instead of at page load, then never again.
//
// Falls back to "already in view" when IntersectionObserver is unavailable.

import { useEffect, useRef, useState } from "react";

export function useInViewOnce<T extends Element>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
