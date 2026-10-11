// Keyboard shortcuts for the home page — instruments, not decoration.
//
//   t  toggle theme        w  work        a  archive
//   e  experience          c  contact     ←/→  lightbox images
//
// Deliberately quiet: no modifier chords, nothing hijacked while the visitor
// is in the lightbox (that dialog owns Escape and the arrows), nothing fired
// from a text field. Section jumps use the page's own smooth scrolling.
//
// The theme flip goes through applyTheme (localStorage + View Transition
// crossfade) and announces itself, so the lamp toggle stays in sync.

import { useEffect } from "react";
import { applyTheme } from "./theme";

type SectionKey = "w" | "a" | "e" | "c";

const SECTIONS: Record<SectionKey, string> = {
  w: "#work",
  a: "#archive",
  e: "#experience",
  c: "#contact",
};

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
      ) {
        return;
      }
      // The lightbox owns its keys while it is open.
      if (document.querySelector('[role="dialog"]')) return;

      const key = event.key.toLowerCase();
      if (key === "t") {
        event.preventDefault();
        const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        applyTheme(current === "light" ? "dark" : "light");
        return;
      }
      const hash = SECTIONS[key as SectionKey];
      if (hash) {
        event.preventDefault();
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
