import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

type SiteHeaderProps = {
  wordmarkHref: string;
  wordmarkLabel: string;
  wordmarkText: ReactNode;
  navLabel: string;
  /** Omit when the page has no nav links: nav + menu button stay hidden. */
  children?: ReactNode;
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Shared header: display name + theme toggle always visible; below 600px the
// nav links collapse behind a menu icon. Used by home and case-study pages.

// Quiet top-edge scroll progress: a 2px hairline in the accent color. Driven
// by direct style mutation inside rAF (no re-renders, transform-only), hidden
// when the page has nothing to scroll. Decorative — position is available to
// assistive tech via the scrollbar, so it stays aria-hidden.
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${progress})`;
      el.style.opacity = max > 0 ? "1" : "0";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <span ref={ref} className="scroll-progress" aria-hidden="true" />;
}

// Floating "back to top" — appears once the visitor is a full viewport down,
// which adapts to every viewport (a short landscape phone gets a shorter
// runway than a desktop monitor). Hidden again at the top, and untabbable
// while hidden so the keyboard never meets an invisible control.
export function GoToTop() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const show = max > 0 && window.scrollY > window.innerHeight;
      el.classList.toggle("is-visible", show);
      el.tabIndex = show ? 0 : -1;
      el.setAttribute("aria-hidden", show ? "false" : "true");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      ref={ref}
      className="to-top"
      type="button"
      aria-label="Back to top"
      data-cuelume-tap
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
export function SiteHeader({
  wordmarkHref,
  wordmarkLabel,
  wordmarkText,
  navLabel,
  children,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  return (
    <header className="site-header">
      <a className="wordmark" href={wordmarkHref} aria-label={wordmarkLabel}>
        {wordmarkText}
      </a>
      <div className="site-header__group" ref={groupRef}>
        {children && (
          <nav className="site-nav" aria-label={navLabel} data-cuelume-navigate>
            {children}
          </nav>
        )}
        <SoundToggle />
        <ThemeToggle />
        {children && (
          <div className="nav-menu">
            <button
              type="button"
              className="nav-menu-btn"
              ref={buttonRef}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setOpen((value) => !value)}
              data-cuelume-tap
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
            {open && (
              <nav
                className="nav-menu-panel"
                id={menuId}
                aria-label={navLabel}
                onClick={() => setOpen(false)}
                data-cuelume-navigate
              >
                {children}
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
