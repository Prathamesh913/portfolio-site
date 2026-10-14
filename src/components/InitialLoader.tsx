import { useEffect, useRef, useState } from "react";

type InitialLoaderProps = { onDone: () => void };

const LINES = [
  "> prathamesh.portfolio",
  "> init system......... ok",
  "> load media......... ok",
  "> load case studies.. ok",
  "> render interface... ok",
  "> ready",
];

const THRESHOLDS = [0, 10, 28, 48, 70, 86];

export function InitialLoader({ onDone }: InitialLoaderProps) {
  const reduce = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const duration = reduce.current ? 700 : 1800;
    const start = performance.now();
    let raf = 0;
    let doneTimer = 0;

    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        doneTimer = window.setTimeout(() => onDoneRef.current(), 340);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  const visibleCount = THRESHOLDS.reduce(
    (n, t, i) => (progress >= t ? i + 1 : n),
    0
  );
  const clampedVisible = Math.min(visibleCount, LINES.length);

  return (
    <div
      className={`initial-loader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="initial-loader__frame">
        <p className="initial-loader__head">BOOT · PORTFOLIO</p>
        <div className="initial-loader__lines" aria-hidden="true">
          {LINES.slice(0, clampedVisible).map((line, i) => (
            <div
              key={line}
              className={`initial-loader__line${
                i === clampedVisible - 1 && progress < 100 ? " is-active" : ""
              }`}
            >
              {line}
            </div>
          ))}
        </div>
        <div className="initial-loader__bar" aria-hidden="true">
          <div
            className="initial-loader__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="initial-loader__pct" aria-hidden="true">
          {Math.round(progress).toString().padStart(3, "0")}%
        </p>
        <span className="sr-only">
          {progress >= 100 ? "Portfolio loaded" : "Loading portfolio"}
        </span>
      </div>
    </div>
  );
}
