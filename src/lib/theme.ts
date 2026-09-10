export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

export function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  const swap = () => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  };
  // Bridge the full-page variable swap with a cross-fade; fall back to an
  // instant swap when View Transitions are unsupported or motion is reduced.
  const vt = (
    document as Document & { startViewTransition?: (update: () => void) => void }
  ).startViewTransition;
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && typeof vt === "function") {
    vt.call(document, swap);
  } else {
    swap();
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode — theme still applies for this session.
  }
}
