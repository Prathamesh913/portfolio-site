# 002 — Dissolve the CRT poster through snow on a channel change

- **Status**: TODO
- **Commit**: 98cd6e2
- **Severity**: LOW
- **Category**: Preventing a jarring change (teleporting state)
- **Estimated scope**: 2 files, ~30 lines (one effect + one layer in the component, one CSS rule + one keyframe + one reduced-motion line)

## Problem

When the Trakt item changes between data refreshes, the outgoing poster is
unmounted instantly and the incoming one fades in after a 280ms delay. For
~280ms the screen is nothing but snow, and the previous picture disappears with
no exit at all — a hard cut where the card's whole metaphor is a tuned-in set.

```tsx
/* src/components/objects/CRTScreen.tsx:36-46 — current */
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
```

```css
/* src/index.css:868-874 — current */
.crt__poster {
  display: block; width: 100%; height: 100%; object-fit: cover;
}
/* The picture only exists once the set is switched on, and fades in after the
   snow burst — so a new poster also arrives with a screen refresh. */
.crt:not(.is-on) .crt__poster { opacity: 0; }
.crt.is-on .crt__poster { animation: crt-picture-in 420ms ease-out 280ms both; }
```

## Target

Keep the outgoing poster mounted as a second, decorative layer for one short
fade, so the change reads: old picture dissolves (0–160ms) → snow (160–280ms) →
new picture fades in (280–700ms, the existing `crt-picture-in`). The incoming
fade-in timing is unchanged, so the initial power-on sequence is untouched.

Exact end-state CSS (additions only; nothing existing is edited except the
reduced-motion block):

```css
/* Channel change: the outgoing picture dissolves over the snow while the new
   one fades in, so a new Trakt item never cuts instantly. */
.crt__poster--out {
  position: absolute; inset: 0;
  animation: crt-picture-out 160ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
@keyframes crt-picture-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

Exact end-state component (additions only):

```tsx
import { useEffect, useId, useRef, useState } from "react";

const POSTER_CLEANUP_MS = 800; // incoming fade ends at 700ms (280ms delay + 420ms)

// inside CRTScreen(), after `const hasArt = ...`:
const [outgoing, setOutgoing] = useState<string | null>(null);
const previousPoster = useRef(poster);

// Channel change: hold the outgoing poster for one short fade so a new Trakt
// item dissolves through the snow instead of cutting instantly.
useEffect(() => {
  const previous = previousPoster.current;
  if (previous === poster) return;
  previousPoster.current = poster;
  if (!previous) return;
  setOutgoing(previous);
  const timer = setTimeout(() => setOutgoing(null), POSTER_CLEANUP_MS);
  return () => clearTimeout(timer);
}, [poster]);
```

Markup inside `.crt__picture`, replacing the current poster block:

```tsx
<span className="crt__picture">
  {outgoing && hasArt && (
    <img
      className="crt__poster crt__poster--out"
      src={outgoing}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  )}
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
```

Reduced motion — add one line inside the existing block at
`src/index.css:1008-1010` so the frozen outgoing layer can never sit on top of
the new picture:

```css
.crt.is-on .crt__tube,
.crt.is-on .crt__static,
.crt.is-on .crt__poster { animation: none; }
.crt__poster--out { display: none; }
```

## Repo conventions to follow

- The card already distinguishes "first paint" from "content changed" with React
  keys and CSS animations; see `CRTScreen.tsx:37` (`key={poster}`) and the
  `crt-picture-in` keyframe at `index.css:934-939`.
- Timers are always cleared; see the pattern at
  `src/components/objects/RecordPlayer.tsx:66-71`.
- Strong curves are written literally in this repo (no easing tokens exist), e.g.
  `cubic-bezier(0.23, 1, 0.32, 1)` at `index.css:784` (the note glyph fade) and
  `cubic-bezier(0.32, 0.72, 0.3, 1)` at `index.css:754` (the tonearm). Use the
  same literal form.

## Steps

1. `src/components/objects/CRTScreen.tsx`
   - Change the import to `import { useEffect, useId, useRef, useState } from "react";` — note `useId` is already imported by the sibling `RecordPlayer`; only add what is needed: `useEffect`, `useRef`, `useState` (drop the now-unused import if it was not already there).
   - Add `const POSTER_CLEANUP_MS = 800;` next to the existing module constants.
   - Add the `outgoing` state + `previousPoster` ref + the effect from **Target** inside the component.
   - Replace the poster block with the markup in **Target** (outgoing layer first, then the existing `key={poster}` img / fallback).
2. `src/index.css`
   - Add `.crt__poster--out` + `@keyframes crt-picture-out` from **Target** directly after the `.crt.is-on .crt__poster` rule (line 874).
   - Add `.crt__poster--out { display: none; }` to the reduced-motion block after line 1010.
3. Do not touch `crt-picture-in`, the power-on keyframes, the static, or any other file.

## Boundaries

- Do NOT change `crt-picture-in`, `crt-power-on`, `crt-static-burst`,
  `crt-static-drift`, the power-on/arming sequence, or any timing of the initial
  card entrance.
- Do NOT touch any file other than `src/components/objects/CRTScreen.tsx` and
  `src/index.css`. Watching's data flow, the Trakt backend, and the other
  Currently cards are out of scope.
- Do NOT add dependencies, canvas, JS animation loops, or per-frame timers. One
  `setTimeout` per poster change is the only new JS.
- Accepted edge: if the Trakt item changes again inside the 800ms window, the
  intermediate poster is replaced as the outgoing layer and re-fades from full
  opacity. Do not engineer around it.
- If the cited code does not match what you find (drift since commit `98cd6e2`),
  STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` (no output) and `npm run build` (succeeds).
- **Feel check**: `npm run preview`, scroll to Currently, then in DevTools set
  the Animations panel to 10% playback and confirm, in order:
  - On first view: the power-on, snow burst, then picture — unchanged from today.
  - Change the poster (in DevTools, edit the `<img>` `src` to another Trakt
    poster URL, or force a different `poster` prop): the old picture fades out
    over 160ms, snow is visible for a beat, then the new picture fades in.
  - No frame shows both pictures at full opacity, and there is no hard cut.
  - The outgoing `<img>` is gone from the DOM ~800ms after the change (Elements
    panel: exactly one `img.crt__poster` remains).
  - Toggle DevTools → Rendering → "Emulate prefers-reduced-motion": on a poster
    change the old picture is never visible over the new one (`.crt__poster--out`
    is `display: none`).
- **Done when**: a poster change dissolves through snow with no instant cut, the
  initial power-on timing is byte-identical to before, and exactly one poster
  image remains mounted once the transition settles.
