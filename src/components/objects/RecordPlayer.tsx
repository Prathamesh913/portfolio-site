// RecordPlayer — Currently → Listening.
//
// A miniature turntable drawn as one physical stack: body → platter → record
// → label, with a curved tonearm anchored to a fixed pivot. The real Spotify
// artwork is the record's center label and rotates with the record.
//
// The tonearm click really plays the song: the track runs inside a hidden
// Spotify embed (IFrame API, visitor's own context — no owner grant, no
// Premium-on-owner). Anything that fails falls back to the illustration-only
// toggle, so the card never breaks.

import { useEffect, useId, useRef, useState } from "react";
import {
  loadSpotifyEmbed,
  spotifyUriFromUrl,
  type SpotifyEmbedController,
} from "../../lib/spotifyPlayer";

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
  trackUrl,
}: {
  art?: string;
  album?: string;
  playing: boolean;
  /** open.spotify.com track/episode URL — played when the tonearm is clicked. */
  trackUrl?: string;
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
  const [visualPlaying, setVisualPlaying] = useState(true);
  const [parked, setParked] = useState(false);
  const [notesPhase, setNotesPhase] = useState<NotesPhase>("playing");
  const notesPhaseRef = useRef<NotesPhase>("playing");
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  // Real-playback wiring: one hidden embed controller for the card's life,
  // what it currently holds, and whether it is audibly playing. Events are
  // the source of truth; the refs below only stage instant visuals.
  const embedHostRef = useRef<HTMLSpanElement | null>(null);
  // Wrapper survives createController (which replaces the host span with its
  // iframe); its connectedness is the unmount guard. Creation is keyed to the
  // host identity, so StrictMode double-effects share one attempt on one node
  // while real remounts (new node) start fresh.
  const embedWrapRef = useRef<HTMLSpanElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  // Failed creations retry on clicks after the window; successes stick via
  // controllerRef above, so one blocked-CDN moment can't wedge the session.
  const controllerPromiseRef = useRef<{
    host: HTMLElement;
    at: number;
    p: Promise<SpotifyEmbedController | null>;
  } | null>(null);
  const lastUriRef = useRef<string | null>(null);
  const realPlayingRef = useRef(false);
  const [realActive, setRealActive] = useState(false);

  /** Awaited embed call — false instead of an unhandled rejection. */
  const callEmbedAsync = async (fn: () => unknown): Promise<boolean> => {
    try {
      await fn();
      return true;
    } catch (e) {
      console.warn("[turntable] embed call rejected", e);
      return false;
    }
  };

  // Every visit opens mid-performance: spinning record, arm on it, notes up.
  // After mount, live Spotify data takes over until the visitor takes control.
  // A new track starts from fresh data, with the arm back on the record.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (previousTrack.current !== trackKey) {
      previousTrack.current = trackKey;
      userToggled.current = false;
      setVisualPlaying(playing);
      setParked(false);
      // Follow the new track in the embed when it was playing.
      const follow = async () => {
        if (controllerRef.current && realPlayingRef.current) {
          const uri = spotifyUriFromUrl(trackUrl);
          const controller = controllerRef.current;
          if (uri && (await callEmbedAsync(() => {
            controller.loadUri(uri);
            controller.play();
          }))) {
            lastUriRef.current = uri;
          }
        }
      };
      follow().catch(() => {});
      return;
    }
    if (!userToggled.current) setVisualPlaying(playing);
  }, [playing, trackKey]);

  useEffect(() => {
    return () => {
      if (armTimer.current) clearTimeout(armTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      // Keep an in-flight creation: StrictMode remounts share it (same host
      // node, so the identity check below dedupes). Drop only the live
      // controller, which belonged to the detached tree.
      controllerRef.current = null;
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

  /** Hidden embed controller, created once per host node. Null = blocked CDN / no URI. */
  const EMBED_RETRY_MS = 60_000;
  const ensureEmbed = (): Promise<SpotifyEmbedController | null> => {
    if (controllerRef.current) return Promise.resolve(controllerRef.current);
    const host = embedHostRef.current;
    const cached = controllerPromiseRef.current;
    // Same host node → share the in-flight/fresh attempt (StrictMode-safe).
    // A new node (real remount) or a stale failure always starts fresh.
    if (cached && cached.host === host && Date.now() - cached.at < EMBED_RETRY_MS) return cached.p;
    const uri = spotifyUriFromUrl(trackUrl);
    if (!uri || !host) return Promise.resolve(null);
    const attempt = (async (): Promise<SpotifyEmbedController | null> => {
      const api = await loadSpotifyEmbed();
      if (!api) return null;
      return new Promise((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            resolve(null);
          }
        }, 9000);
        api.createController(host, { uri, width: 300, height: 80 }, (controller) => {
          controller.addListener("ready", () => {
            // Guard on the wrapper: createController replaces the host span
            // with its iframe, so the host itself is always detached here —
            // checking it would reject every ready event. The wrapper only
            // detaches on a real unmount.
            const wrap = embedWrapRef.current;
            if (settled || (wrap && !wrap.isConnected)) return;
            settled = true;
            clearTimeout(timer);
            controllerRef.current = controller;
            setRealActive(true);
            console.warn("[turntable] embed ready");
            resolve(controller);
          });
          controller.addListener("playback_update", (e: any) => {
            const state = e?.data;
            console.warn("[turntable] playback_update", state && { paused: state.isPaused, buffering: state.isBuffering });
            if (!state || state.isBuffering) return;
            // Ignore pre-click sync: background warm-up must not disturb the
            // staged mid-performance default.
            if (!userToggled.current && !realPlayingRef.current) return;
            realPlayingRef.current = !state.isPaused;
            setVisualPlaying(!state.isPaused);
            setParked(state.isPaused);
          });
        });
      });
    })();
    controllerPromiseRef.current = { host, at: Date.now(), p: attempt };
    attempt.catch(() => {
      if (controllerPromiseRef.current?.p === attempt) controllerPromiseRef.current = null;
    });
    return attempt;
  };

  const togglePlayback = async () => {
    userToggled.current = true;
    const uri = spotifyUriFromUrl(trackUrl);
    const prevVisual = visualPlaying;
    if (!uri) {
      // Illustration-only: no playable URL (e.g. fallback search link).
      setParked(prevVisual);
      setVisualPlaying(!prevVisual);
      return;
    }
    // First click starts the track (matching the staged mid-performance
    // default); afterwards the embed's transport state drives the intent.
    const willPlay = !(controllerRef.current && realPlayingRef.current);
    // Optimistic visuals: the arm, spin, and notes react on click.
    // playback_update events confirm or correct what was just staged.
    setParked(!willPlay);
    setVisualPlaying(willPlay);
    const controller = await ensureEmbed().catch(() => null);
    if (!controller) {
      console.warn(`[turntable] embed unavailable (hasUri=${!!uri}) — illustration only`);
      return; // keep the staged illustration
    }
    if (uri !== lastUriRef.current) {
      if (!(await callEmbedAsync(() => controller.loadUri(uri)))) return;
      lastUriRef.current = uri;
    }
    if (await callEmbedAsync(() => (willPlay ? controller.play() : controller.pause()))) {
      realPlayingRef.current = willPlay;
      return; // staged visuals already match
    }
    // Rejected (e.g. autoplay policy) — roll back so the next click retries
    // instead of sending a no-op pause into silence.
    realPlayingRef.current = !willPlay;
    setParked(willPlay);
    setVisualPlaying(!willPlay);
  };

  // Pre-create the hidden embed while idle, so a warm click is just
  // loadUri + play. No audio starts here, keeping autoplay safe. Re-runs
  // when the track URL arrives late (ensureEmbed is idempotent once ready).
  useEffect(() => {
    if (!spotifyUriFromUrl(trackUrl)) return;
    let idleId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const warm = () => {
      ensureEmbed().catch(() => {});
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(warm, { timeout: 3000 });
      return () => {
        if (idleId !== null) w.cancelIdleCallback?.(idleId);
      };
    }
    timer = setTimeout(warm, 1500);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [trackUrl]);

  return (
    <span className={`deck${visualPlaying ? " is-playing" : ""}${parked ? " is-parked" : ""}`}>
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
        title={visualPlaying ? "Pause" : "Play the song"}
        onMouseEnter={() => {
          ensureEmbed().catch(() => {});
        }}
        onFocus={() => {
          ensureEmbed().catch(() => {});
        }}
        onClick={() => {
          togglePlayback().catch(() => {});
        }}
      />
      {/* Hidden Spotify embed: the API replaces the inner host with its
          iframe, so the clipping styles live on this wrapper — which is
          never replaced — keeping the player at 1px and out of layout. */}
      <span
        ref={embedWrapRef}
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
      >
        <span ref={embedHostRef} />
      </span>
      <span id={playerDescription} className="sr-only">
        {realActive
          ? "This turntable plays the current track on Spotify."
          : "This visual player does not control Spotify playback."}
      </span>
    </span>
  );
}
