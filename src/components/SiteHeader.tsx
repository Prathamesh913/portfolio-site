import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

type SiteHeaderProps = {
  wordmarkHref: string;
  wordmarkLabel: string;
  wordmarkText: ReactNode;
  navLabel: string;
  children: ReactNode;
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
        <nav className="site-nav" aria-label={navLabel}>
          {children}
        </nav>
        <ThemeToggle />
        <div className="nav-menu">
          <button
            type="button"
            className="nav-menu-btn"
            ref={buttonRef}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          {open && (
            <nav
              className="nav-menu-panel"
              id={menuId}
              aria-label={navLabel}
              onClick={() => setOpen(false)}
            >
              {children}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
