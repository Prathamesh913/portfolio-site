import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, getSystemTheme, getStoredTheme, type Theme } from "../lib/theme";

function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isOn = theme === "dark";

  // Apply on mount (covers the no-JS pre-paint fallback) and on every change.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow the OS while the user hasn't picked explicitly; stay in sync across tabs.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onMedia = () => {
      if (!getStoredTheme()) setTheme(getSystemTheme());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "portfolio-theme" && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
      }
    };
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <button
      type="button"
      className={`lamp-toggle${isOn ? " is-on" : ""}`}
      aria-pressed={isOn}
      aria-label={isOn ? "Switch to light mode" : "Switch to dark mode"}
      title={isOn ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(nextTheme)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="lamp-glow" cx="12" cy="14" r="7" />
        {/* cord */}
        <line className="lamp-stroke" x1="12" y1="1" x2="12" y2="5.5" />
        {/* shade */}
        <path className="lamp-shade" d="M8.2 11 L10.3 5.5 H13.7 L15.8 11 Z" />
        <line className="lamp-stroke" x1="7" y1="11" x2="17" y2="11" />
        {/* pull chain */}
        <line className="lamp-stroke lamp-pull" x1="15.4" y1="11" x2="15.4" y2="14" />
        <circle className="lamp-knob" cx="15.4" cy="15" r="1" />
        {/* bulb */}
        <circle className="lamp-bulb" cx="12" cy="14" r="2" />
        {/* rays — only visible when the lamp is on */}
        <g className="lamp-rays">
          <line x1="4.2" y1="14" x2="5.8" y2="14" />
          <line x1="18.2" y1="14" x2="19.8" y2="14" />
          <line x1="6.4" y1="19.4" x2="7.5" y2="18.3" />
          <line x1="17.6" y1="19.4" x2="16.5" y2="18.3" />
        </g>
      </svg>
    </button>
  );
}
