import { useEffect, useState, type ReactNode } from "react";
import { Skeleton, SkulletProvider } from "skullet/react";
import { useInViewOnce } from "./useInViewOnce";

type SkulletMode = "light" | "dark" | "system";

function modeFromDom(): SkulletMode {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

/**
 * Site-wide Skullet setup (`npm i skullet`).
 *
 * Palette follows the portfolio's orange/black instrument look:
 * - dark: soft white base on black, quiet highlight
 * - light: faint black base on porcelain, bright highlight
 * A slow shimmer matches the calm plasma backdrop, and `smart` reveal
 * crossfades fast loads instead of flashing a skeleton.
 * Mode syncs to the lamp toggle (`theme-changed` event) so skeletons
 * match whichever theme the page is actually in.
 */
export function PortfolioSkullet({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SkulletMode>(modeFromDom);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setMode(detail === "light" || detail === "dark" ? detail : modeFromDom());
    };
    window.addEventListener("theme-changed", onChange);
    return () => window.removeEventListener("theme-changed", onChange);
  }, []);

  return (
    <SkulletProvider
      mode={mode}
      reveal="smart"
      theme={{
        light: { base: "rgb(0 0 0 / 0.07)", highlight: "rgb(255 255 255 / 0.6)" },
        dark: { base: "rgb(255 255 255 / 0.08)", highlight: "rgb(255 255 255 / 0.1)" },
        animation: "shimmer",
        speed: "slow",
        radius: "6px",
      }}
      text={{ top: "ascender", bottom: "descender" }}
    >
      {children}
    </SkulletProvider>
  );
}

/**
 * Below-fold helper for sections whose data ships bundled (no fetch to wait
 * for). The section shows a measured skeleton until its first scroll into
 * view, then reveals into the real content — whose lazy images get their own
 * per-image crossfade. The observer lives on this stable wrapper (never
 * inside the skeleton panes), so the reveal fires exactly once.
 */
export function SkeletonUntilView({
  id,
  label,
  children,
}: {
  id?: string;
  label?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} className="skullet-reveal">
      <Skeleton id={id} label={label} loading={!inView}>
        {children}
      </Skeleton>
    </div>
  );
}
