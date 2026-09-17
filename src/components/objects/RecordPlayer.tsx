// RecordPlayer — Currently → Listening.
//
// A miniature turntable drawn as one physical stack: body → platter → record
// → label, with a curved tonearm anchored to a fixed pivot. The real Spotify
// artwork is the record's center label and rotates with the record. The local
// visual-player state is intentionally separate from Spotify playback control:
// clicking the tonearm changes this illustration only.

import { useEffect, useId, useRef, useState } from "react";

const CENTER = { x: 60, y: 63 };
const PIVOT = { x: 124, y: 30 };
const STYLUS = { x: 75.8, y: 91.8 };
const GROOVES = (() => {
  const points: string[] = [];
  const steps = 216;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * 9;
    const radius = 17 + (39 - 17) * t;
    points.push(`${(CENTER.x + radius * Math.cos(angle)).toFixed(2)} ${(CENTER.y + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
})();

const ARM_SETTLE_MS = 620; // matches the .deck__arm transition
const NOTE_FADE_MS = 620; // 500ms glyph fade + margin

type NotesPhase = "off" | "arming" | "playing" | "fading";

export function RecordPlayer({
  art,
  album,
  playing,
}: {
  art?: string;
  album?: string;
  playing: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const labelClip = `deck-label-${uid}`;
  const gloss = `deck-gloss-${uid}`;
  const patch = `deck-patch-${uid}`;
  const playerDescription = `deck-description-${uid}`;
  const trackKey = `${album ?? ""}|${art ?? ""}`;
  const previousTrack = useRef(trackKey);
  const userToggled = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visualPlaying, setVisualPlaying] = useState(playing);
  const [notesPhase, setNotesPhase] = useState<NotesPhase>(playing ? "playing" : "off");
  const notesPhaseRef = useRef(notesPhase);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live Spotify data initializes the illustration until the visitor takes
  // control of the local visual player. A new track starts from fresh data.
  useEffect(() => {
    if (previousTrack.current !== trackKey) {
      previousTrack.current = trackKey;
      userToggled.current = false;
      setVisualPlaying(playing);
      return;
    }
    if (!userToggled.current) setVisualPlaying(playing);
  }, [playing, trackKey]);

  useEffect(() => {
    return () => {
      if (armTimer.current) clearTimeout(armTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (armTimer.current) { clearTimeout(armTimer.current); armTimer.current = null; }
    if (fadeTimer.current) { clearTimeout(fadeTimer.current); fadeTimer.current = null; }

    if (visualPlaying) {
      if (notesPhaseRef.current === "playing") return;
      notesPhaseRef.current = "arming";
      setNotesPhase("arming");
      armTimer.current = setTimeout(() => {
        notesPhaseRef.current = "playing";
        setNotesPhase("playing");
      }, ARM_SETTLE_MS);
      return;
    }

    if (notesPhaseRef.current === "off") return;
    if (notesPhaseRef.current === "arming") {
      notesPhaseRef.current = "off";
      setNotesPhase("off");
      return;
    }
    notesPhaseRef.current = "fading";
    setNotesPhase("fading");
    fadeTimer.current = setTimeout(() => {
      notesPhaseRef.current = "off";
      setNotesPhase("off");
    }, NOTE_FADE_MS);
  }, [visualPlaying]);

  const toggleVisualPlayback = () => {
    userToggled.current = true;
    setVisualPlaying((current) => !current);
  };

  return (
    <span className={`deck${visualPlaying ? " is-playing" : ""}`}>
      <svg className="deck__svg" viewBox="0 0 160 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={labelClip}>
            <circle cx={CENTER.x} cy={CENTER.y} r="14" />
          </clipPath>
          <radialGradient id={gloss} cx="36%" cy="28%" r="74%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="46%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id={patch}>
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.085" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect className="deck__shadow" x="7" y="17" width="148" height="100" rx="12" />
        <rect className="deck__body" x="6" y="13" width="148" height="100" rx="12" />
        <rect className="deck__body-inner" x="8.2" y="15.2" width="143.6" height="95.6" rx="10" />
        <path className="deck__body-lip" d="M12 14.5 H148" />

        <circle className="deck__platter" cx={CENTER.x} cy={CENTER.y} r="43" />
        <circle className="deck__platter-ring" cx={CENTER.x} cy={CENTER.y} r="41" />
        <circle className="deck__record-shadow" cx={CENTER.x} cy={CENTER.y + 1.6} r="42" />

        <g className="deck__spin">
          <circle className="deck__record" cx={CENTER.x} cy={CENTER.y} r="41" />
          <path className="deck__grooves" d={GROOVES} />
          <ellipse
            className="deck__gloss"
            cx={CENTER.x}
            cy={CENTER.y}
            rx="20"
            ry="35"
            transform={`rotate(-28 ${CENTER.x} ${CENTER.y})`}
            fill={`url(#${patch})`}
          />
          <circle className="deck__label" cx={CENTER.x} cy={CENTER.y} r="14" />
          {art && (
            <image
              href={art}
              x="46"
              y="49"
              width="28"
              height="28"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${labelClip})`}
            />
          )}
          <circle className="deck__label-ring" cx={CENTER.x} cy={CENTER.y} r="14" />
        </g>

        <circle className="deck__sheen" cx={CENTER.x} cy={CENTER.y} r="41" fill={`url(#${gloss})`} />
        <circle className="deck__spindle-hole" cx={CENTER.x} cy={CENTER.y} r="2.6" />
        <circle className="deck__spindle-glint" cx={CENTER.x - 0.8} cy={CENTER.y - 0.8} r="0.8" />

        <rect className="deck__rest" x="88.5" y="101.7" width="9" height="4" rx="2" />

        <g className="deck__arm">
          <path className="deck__arm-shadow" d="M127 20 C118 56 100 84 78 91" transform="translate(0 1.1)" />
          <path className="deck__arm-tube" d="M127 20 C118 56 100 84 78 91" />
          <circle className="deck__weight" cx="127.4" cy="17.6" r="5" />
          <rect
            className="deck__cartridge"
            x="75.5"
            y="85.5"
            width="11"
            height="6.8"
            rx="2.2"
            transform="rotate(-18 81 88.9)"
          />
          <circle className="deck__stylus" cx={STYLUS.x} cy={STYLUS.y} r="1.1" />
        </g>

        <circle className="deck__pivot-base" cx={PIVOT.x} cy={PIVOT.y} r="7" />
        <circle className="deck__pivot" cx={PIVOT.x} cy={PIVOT.y} r="4.2" />
        <circle className="deck__pivot-dot" cx={PIVOT.x} cy={PIVOT.y} r="1.5" />
      </svg>

      {notesPhase !== "off" && (
        <span className={`deck__notes is-${notesPhase}`} aria-hidden="true">
          <span className="deck__note deck__note--one"><span className="deck__note-glyph">♪</span></span>
          <span className="deck__note deck__note--two"><span className="deck__note-glyph">♫</span></span>
          <span className="deck__note deck__note--three"><span className="deck__note-glyph">♪</span></span>
        </span>
      )}

      <button
        className="deck__arm-button"
        type="button"
        aria-label={visualPlaying ? "Pause music" : "Play music"}
        aria-pressed={visualPlaying}
        aria-describedby={playerDescription}
        title={visualPlaying ? "Pause visual player" : "Play visual player"}
        onClick={toggleVisualPlayback}
      />
      <span id={playerDescription} className="sr-only">
        This visual player does not control Spotify playback.
      </span>
    </span>
  );
}
