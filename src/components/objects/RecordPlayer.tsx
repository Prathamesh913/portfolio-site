// RecordPlayer — Currently → Listening.
//
// A miniature turntable drawn as one physical stack: body → platter → record
// → label, with a curved tonearm anchored to a fixed pivot. The real Spotify
// artwork is the record's center label and rotates with the record.
//
// The tonearm click really plays the song: it pairs Spotify's Web Playback
// SDK (a hidden browser player on the owner's account, Premium required) and
// starts the current track. Anything that fails — no Premium, blocked SDK,
// expired grant — falls back to the illustration-only toggle, so the card
// never breaks.

import { useEffect, useId, useRef, useState } from "react";
import {
  fetchPlayerToken,
  loadSpotifySDK,
  pauseTrack,
  resumeTrack,
  spotifyUriFromUrl,
  startTrack,
  transferToDevice,
  type SpotifyPlayer,
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
  // Real-playback wiring: the paired SDK player, its device id, whether the
  // pairing ever succeeded, and whether pairing is definitively impossible
  // (no Premium / bad grant) so clicks skip straight to the visual fallback.
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceRef = useRef<string | null>(null);
  const pairingRef = useRef<Promise<boolean> | null>(null);
  const realRef = useRef(false);
  const realPlayingRef = useRef(false);
  const deadRef = useRef(false);
  const [realActive, setRealActive] = useState(false);
  // Play intent + delayed park: starting a track emits a brief paused blip
  // while Spotify buffers — parking on it makes the arm jump away and back.
  // So pause visuals settle 500ms after the event, and any paused event
  // inside 1.5s of a play intent is ignored outright.
  const playIntentRef = useRef(0);
  const parkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notePlayIntent = () => {
    playIntentRef.current = Date.now();
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
      deadRef.current = false;
      // Follow the new track on the real device when it was playing.
      const follow = async () => {
        if (playerRef.current && deviceRef.current && realPlayingRef.current) {
          const token = await fetchPlayerToken();
          const uri = spotifyUriFromUrl(trackUrl);
          if (token && uri && (await startTrack(token, deviceRef.current, uri))) {
            notePlayIntent();
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
      if (parkTimer.current) clearTimeout(parkTimer.current);
      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceRef.current = null;
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

  /** Pair the hidden browser player and claim it as the playback device. */
  const pairPlayer = async (): Promise<boolean> => {
    if (deadRef.current) return false;
    if (playerRef.current && deviceRef.current) return true;
    if (pairingRef.current) return pairingRef.current;
    const attempt = (async (): Promise<boolean> => {
      const sdk = await loadSpotifySDK();
      if (!sdk) return false;
      const w = window as unknown as {
        Spotify: { Player: new (options: Record<string, unknown>) => SpotifyPlayer };
      };
      const token = await fetchPlayerToken();
      if (!token) return false;
      const player = new w.Spotify.Player({
        name: "Portfolio Turntable",
        volume: 0.5,
        getOAuthToken: (cb: (value: string) => void) => {
          fetchPlayerToken().then((fresh) => cb(fresh ?? ""));
        },
      });
      let resolveDevice: (id: string | null) => void = () => {};
      const deviceGate = new Promise<string | null>((resolve) => {
        resolveDevice = resolve;
      });
      const timer = setTimeout(() => resolveDevice(deviceRef.current), 9000);
      player.addListener("ready", ({ device_id }: { device_id?: string }) => {
        if (!device_id) return;
        clearTimeout(timer);
        deviceRef.current = device_id;
        transferToDevice(token, device_id).catch(() => {});
        resolveDevice(device_id);
      });
      player.addListener("not_ready", () => {
        deviceRef.current = null;
      });
      player.addListener("authentication_error", () => {
        deadRef.current = true;
      });
      player.addListener("account_error", () => {
        deadRef.current = true;
      });
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        // Ignore the pre-pair sync: background pairing must not disturb the
        // staged mid-performance default. Only the visitor's gestures and the
        // real session they start drive the illustration.
        if (!userToggled.current && !realRef.current) return;
        realRef.current = true;
        setRealActive(true);
        if (!state.paused) {
          if (parkTimer.current) {
            clearTimeout(parkTimer.current);
            parkTimer.current = null;
          }
          realPlayingRef.current = true;
          setVisualPlaying(true);
          setParked(false);
          return;
        }
        // Buffering blip right after a play intent — not a real pause.
        if (Date.now() - playIntentRef.current < 1500) return;
        realPlayingRef.current = false;
        if (parkTimer.current) clearTimeout(parkTimer.current);
        parkTimer.current = setTimeout(() => {
          setVisualPlaying(false);
          setParked(true);
        }, 500);
      });
      playerRef.current = player;
      const connected = await player.connect().catch(() => false);
      if (!connected) {
        clearTimeout(timer);
        return false;
      }
      const id = await deviceGate;
      if (!id) return false;
      return true;
    })();
    pairingRef.current = attempt;
    try {
      return await attempt;
    } finally {
      pairingRef.current = null;
    }
  };

  const togglePlayback = async () => {
    userToggled.current = true;
    // Real playback first: one Web API call on the pre-paired device —
    // play, pause, and resume all go through here, never the SDK toggle.
    // Visuals update optimistically at click time (zero perceived lag); the
    // state events only confirm. Anything that fails drops through to the
    // illustration-only toggle.
    try {
      const uri = spotifyUriFromUrl(trackUrl);
      if (uri && (await pairPlayer()) && deviceRef.current) {
        const token = await fetchPlayerToken();
        if (token) {
          if (!realRef.current) {
            // First real play: start this track on the portfolio device. The
            // click is the user gesture, so no autoplay block.
            if (await startTrack(token, deviceRef.current, uri)) {
              notePlayIntent();
              realPlayingRef.current = true;
              setRealActive(true);
              setVisualPlaying(true);
              setParked(false);
              return;
            }
            console.warn("[turntable] start track failed — visual fallback");
            deadRef.current = true;
          } else if (realPlayingRef.current) {
            if (await pauseTrack(token, deviceRef.current)) {
              realPlayingRef.current = false;
              setVisualPlaying(false);
              setParked(true);
              return;
            }
            console.warn("[turntable] pause failed — visual fallback");
          } else if (await resumeTrack(token, deviceRef.current)) {
            notePlayIntent();
            realPlayingRef.current = true;
            setVisualPlaying(true);
            setParked(false);
            return;
          } else {
            console.warn("[turntable] resume failed — visual fallback");
          }
        }
      }
    } catch {
      // Fall through to the illustration-only toggle.
    }
    setParked(visualPlaying);
    setVisualPlaying(!visualPlaying);
  };

  // Pre-pair the hidden device while idle: SDK load + connect + transfer all
  // happen before the first click, so play/pause each cost a single API call.
  // No audio starts here (transfer uses play:false), keeping autoplay safe.
  useEffect(() => {
    if (!spotifyUriFromUrl(trackUrl)) return;
    let idleId: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const warm = () => {
      pairPlayer().catch(() => {});
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
  }, []);

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
        onClick={() => {
          togglePlayback().catch(() => {});
        }}
      />
      <span id={playerDescription} className="sr-only">
        {realActive
          ? "This turntable plays the current track on Spotify."
          : "This visual player does not control Spotify playback."}
      </span>
    </span>
  );
}
