// One-shot "stamp" entrance for chip grids (Skills, Toolkit).
//
// When the grid first scrolls into view, each chip lands like a rubber stamp
// — scale + a slight rotation settling to rest, staggered per child (the
// delay is written onto each child as `--stamp-delay`).
//
// The container is `is-armed` immediately by this hook, and the pre-hidden
// state is keyed on that class — so if this JS never runs (or the grid is
// rendered without the hook) the chips simply stay visible. `is-stamped` is
// added once, on first sight.
//
// Reduced motion skips the staging entirely: chips are stamped at mount with
// no animation (the CSS reduce block nulls the keyframes).

import { useEffect, useRef } from "react";

const STAGGER_MS = 50;
const STAGGER_CAP = 12;

export function useChipStamp<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty(
        "--stamp-delay",
        `${Math.min(i, STAGGER_CAP) * STAGGER_MS}ms`
      );
    });
    el.classList.add("is-armed");

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-stamped");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-stamped");
        observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
