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

import { useState } from "react";
import { useInViewOnce } from "../../lib/useInViewOnce";

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
  const { ref, inView } = useInViewOnce<HTMLSpanElement>();
  const hasArt = Boolean(poster) && !failed;

  return (
    <span className={`crt${inView ? " is-on" : ""}${live ? " is-live" : ""}`} ref={ref}>
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
      </span>
      <span className="crt__feet" aria-hidden="true">
        <span className="crt__foot" />
        <span className="crt__foot" />
      </span>
    </span>
  );
}
