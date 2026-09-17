# 001 — Make the vinyl note motion interruptible and physically timed

- **Status**: DONE (executed + reviewed)
- **Commit**: 98cd6e2
- **Severity**: MEDIUM
- **Category**: Interruptibility + Physicality/timing
- **Estimated scope**: 2 files, ~70 lines (one component state machine, one CSS block)

## Problem

Two defects in the musical-note motion of the Currently → Listening turntable.

**1. Stopping snaps every note back to its start pose before fading.**
The float animations are scoped to `.is-playing`, so switching the wrapper to
`.is-fading` *removes* the running animation and applies a fresh keyframe
animation. Keyframes always restart from 0%, so each note jumps to
`opacity: .62; transform: translate(0, 0)` and only then fades — the exact
"instant reposition" the brief forbids.

```css
/* src/index.css:776-786 — current */
.deck__notes.is-playing .deck__note--one {
  animation: deck-note-one 2.8s ease-in-out 0.1s infinite;
}
.deck__notes.is-playing .deck__note--two {
  animation: deck-note-two 3.2s ease-in-out 0.8s infinite;
}
.deck__notes.is-playing .deck__note--three {
  animation: deck-note-three 2.6s ease-in-out 1.35s infinite;
}
.deck__notes.is-fading .deck__note {
  animation: deck-note-fade 520ms ease-out forwards;
}
```

**2. Notes start before the stylus reaches the record.**
`RecordPlayer` starts the notes the instant `visualPlaying` flips true, while the
tonearm is still swinging for 620ms. Music appears before the arm lands, which
inverts the physical cause and effect.

```tsx
/* src/components/objects/RecordPlayer.tsx:68-80 — current */
useEffect(() => {
  if (fadeTimer.current) clearTimeout(fadeTimer.current);
  if (visualPlaying) {
    setNotesMounted(true);
    setNotesMode("playing");
    return;
  }
  if (!notesMounted) return;
  setNotesMode("fading");
  fadeTimer.current = setTimeout(() => {
    setNotesMounted(false);
  }, 620);
}, [notesMounted, visualPlaying]);
```

## Target

A four-phase note lifecycle driven by CSS `animation-play-state` (which
preserves the current pose) plus an inner glyph whose `opacity` transitions:

- `is-arming` — notes mounted, float animations paused at 0%, glyph `opacity: 0` (nothing visible)
- `is-playing` — float animations running, glyph `opacity: 1`
- `is-fading` — float animations **paused at their current pose**, glyph transitions to `opacity: 0` over 500ms
- `off` — notes unmounted

Timing: notes begin **620ms** after the play toggle (matching the
`.deck__arm` transition), and unmount 620ms after the stop toggle (500ms fade +
margin). The float animation is never removed while a note is mounted, so
pausing cannot reset it.

Exact end-state CSS:

```css
/* target */
.deck__note {
  position: absolute;
  color: var(--ink-soft);
  font-family: var(--font);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}
.deck__note--one { left: 44%; top: 50%; animation: deck-note-one 2.8s ease-in-out 0.1s infinite; }
.deck__note--two { left: 70%; top: 30%; animation: deck-note-two 3.2s ease-in-out 0.8s infinite; }
.deck__note--three { left: 20%; top: 62%; animation: deck-note-three 2.6s ease-in-out 1.35s infinite; }
/* Pausing keeps each note exactly where it is; removing the animation would reset it. */
.deck__notes.is-arming .deck__note,
.deck__notes.is-fading .deck__note { animation-play-state: paused; }
.deck__note-glyph {
  display: inline-block;
  opacity: 0;
  transition: opacity 500ms cubic-bezier(0.23, 1, 0.32, 1);
}
.deck__notes.is-playing .deck__note-glyph { opacity: 1; }
```

`@keyframes deck-note-one`, `deck-note-two`, `deck-note-three` are unchanged.
`@keyframes deck-note-fade` is deleted (nothing references it).

Exact end-state component:

```tsx
const ARM_SETTLE_MS = 620; // matches the .deck__arm transition
const NOTE_FADE_MS = 620; // 500ms glyph fade + margin

type NotesPhase = "off" | "arming" | "playing" | "fading";

// inside RecordPlayer(), replacing notesMounted/notesMode:
const [notesPhase, setNotesPhase] = useState<NotesPhase>(playing ? "playing" : "off");
const notesPhaseRef = useRef(notesPhase);
const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
```

Markup for the notes (the glyph becomes a nested span so its opacity can
transition independently of the float transform):

```tsx
{notesPhase !== "off" && (
  <span className={`deck__notes is-${notesPhase}`} aria-hidden="true">
    <span className="deck__note deck__note--one"><span className="deck__note-glyph">♪</span></span>
    <span className="deck__note deck__note--two"><span className="deck__note-glyph">♫</span></span>
    <span className="deck__note deck__note--three"><span className="deck__note-glyph">♪</span></span>
  </span>
)}
```

## Repo conventions to follow

- Motion lives in `src/index.css` as plain CSS keyframes; no animation library exists in this repo.
- The turntable already pairs a JS state machine with CSS classes: `src/components/objects/RecordPlayer.tsx:46-85` and `src/index.css:740-756` (`is-playing` toggles `animation-play-state` on the record).
- Reduced motion is handled per-feature with a `@media (prefers-reduced-motion: reduce)` block; the turntable's lives at `src/index.css:1003-1011`. Follow that pattern.
- Timers are cleaned up in an unmount effect; see `src/components/objects/RecordPlayer.tsx:62-66`.

## Steps

1. `src/components/objects/RecordPlayer.tsx`
   - Replace `type NotesMode = "playing" | "fading";` with `type NotesPhase = "off" | "arming" | "playing" | "fading";` and add the two constants `ARM_SETTLE_MS` / `NOTE_FADE_MS`.
   - Replace the `notesMounted` / `notesMode` state with `notesPhase` + `notesPhaseRef`, and add `armTimer`.
   - Replace the note-lifecycle effect (lines 68-80) with the effect in **Target**.
   - Extend the unmount cleanup effect (lines 62-66) to also clear `armTimer.current`.
   - Replace the notes markup (lines 168-174) with the nested-glyph markup in **Target**.
   - Do not touch `visualPlaying`, `userToggled`, `trackKey`, the tonearm button, the SVG, or any other card.
2. `src/index.css`
   - Replace lines 763-806 (`.deck__note`, the three `.deck__note--*` position rules, the `.is-playing` animation rules, the `.is-fading` rule, and `@keyframes deck-note-fade`) with the **Target** CSS. Keep the three `deck-note-*` keyframes verbatim.
   - In the reduced-motion block (lines 1003-1011) replace
     `.deck__notes.is-playing .deck__note { animation: none; opacity: 0.55; transform: none; }` and
     `.deck__notes.is-fading .deck__note { animation: none; opacity: 0; }`
     with:
     ```css
     .deck__note { animation: none; }
     .deck__note-glyph { transition: none; }
     .deck__notes.is-playing .deck__note-glyph { opacity: 0.55; }
     .deck__notes.is-arming .deck__note-glyph,
     .deck__notes.is-fading .deck__note-glyph { opacity: 0; }
     ```
3. Delete `@keyframes deck-note-fade` (lines 803-806) once nothing references it.

## Boundaries

- Do NOT touch Watching, Reading, GitHub Activity, Bookshelf, Outside of Work, Work, Experience, the Trakt/Spotify backends, or `src/components/CurrentlySection.tsx`.
- Do NOT change the note glyphs, their positions, the three keyframe float paths, the tonearm button, `aria-*`, or the Spotify data flow.
- Do NOT add dependencies, canvas, JS animation loops, or new DOM nodes beyond the three nested glyph spans.
- If the cited code does not match what you find (drift since commit `98cd6e2`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` (no output) and `npm run build` (succeeds; `tsc -b && vite build`).
- **Feel check**: `npm run preview`, open the page, scroll to Currently, and confirm in this order:
  - Click the tonearm: the arm swings for ~620ms, and only as it settles do the notes fade in and drift.
  - While notes are mid-flight, click to stop: each note freezes in its current pose and fades out over ~500ms. No note may jump sideways or jump in brightness at the moment of the click.
  - Click to start again within ~600ms: notes fade back in after the arm lands, with no duplicated notes.
  - Toggle start/stop rapidly 6-8 times: note count in the DOM stays 0 or 3, never 6+.
  - In DevTools → Rendering → "Emulate prefers-reduced-motion": notes are static at 0.55 opacity while playing, disappear when stopped, and the click still toggles.
- **Done when**: stopping never resets a note's transform/opacity, notes first appear only after the tonearm settles, the DOM never holds more than three note elements, and the reduced-motion path still renders.
