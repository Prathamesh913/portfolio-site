// CRTScreen — Currently → Watching.
//
// A traditional landscape 4:3 CRT. The portrait Trakt poster is contained and
// centred inside the 4:3 screen (never stretched or cropped), and the unused
// screen area either side of it carries monochrome television snow — bright
// snow in dark mode, dark snow in light mode.
//
// Layering is physical: cabinet → bezel → recessed screen well → tube (snow →
// picture → glass). Power-on happens once when the card first enters the
// viewport, then everything settles; reduced motion renders it static.
//
// Hidden trick: the front panel is a power switch. Shutdown plays the
// Samsung-style collapse (picture squeezes into a bright line, holds, winks
// out) before the power is cut; startup blooms the line back into the full
// picture. Pure state sequencing — no data involved.

import { useEffect, useRef, useState } from "react";
import { useInViewOnce } from "../../lib/useInViewOnce";

// Matches the shutdown choreography: 200ms squeeze + 240ms line hold, fade lands at 400ms.
const COLLAPSE_MS = 400;

export function CRTScreen({
  poster,
  title,
  live,
}: {
  poster?: string;
  title: string;
  live: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [userOff, setUserOff] = useState(false);
  const [shutting, setShutting] = useState(false);
  const shutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref, inView } = useInViewOnce<HTMLSpanElement>();
  const hasArt = Boolean(poster) && !failed;
  // While the collapse plays the set is still "on" so the tube stays
  // rendered; power is cut when the animation lands.
  const isOn = inView && (!userOff || shutting);

  useEffect(() => {
    return () => {
      if (shutTimer.current) clearTimeout(shutTimer.current);
    };
  }, []);

  const togglePower = () => {
    if (shutTimer.current) {
      // Tapped mid-collapse: abort the shutdown and stay on.
      clearTimeout(shutTimer.current);
      shutTimer.current = null;
      setShutting(false);
      return;
    }
    if (!userOff) {
      setShutting(true);
      shutTimer.current = setTimeout(() => {
        shutTimer.current = null;
        setUserOff(true);
        setShutting(false);
      }, COLLAPSE_MS);
    } else {
      setUserOff(false);
    }
  };

  return (
    <span className={`crt${isOn ? " is-on" : ""}${shutting ? " is-turning-off" : ""}${live ? " is-live" : ""}`} ref={ref}>
      <span className="crt__body">
        <span className="crt__screen">
          <span className="crt__tube">
            <span className="crt__static" aria-hidden="true" />
            <span className="crt__picture">
              {hasArt ? (
                <img
                  key={poster}
                  className="crt__poster"
                  src={poster}
                  alt={`${title} poster`}
                  width={120}
                  height={180}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailed(true)}
                />
              ) : (
                <span className="crt__fallback" aria-hidden="true">
                  {title.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="crt__glass" aria-hidden="true" />
            <span className="crt__scanlines" aria-hidden="true" />
          </span>
          <span className="crt__line" aria-hidden="true" />
        </span>
        <span className="crt__panel" aria-hidden="true">
          <span className="crt__grille">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="crt__controls">
            <span className="crt__led" />
            <span className="crt__knob" />
            <span className="crt__knob" />
          </span>
        </span>
        <button
          className="crt__panel-button"
          type="button"
          aria-label={userOff ? "Turn television on" : "Turn television off"}
          aria-pressed={!userOff}
          title={userOff ? "Turn on" : "Turn off"}
          onClick={togglePower}
        />
      </span>
      <span className="crt__feet" aria-hidden="true">
        <span className="crt__foot" />
        <span className="crt__foot" />
      </span>
    </span>
  );
}
