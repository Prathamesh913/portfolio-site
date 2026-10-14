# 004 — Slow the boot sequence so it reads as a first-run, not a flash

- **Status**: DONE
- **Commit**: 5d7abbb
- **Severity**: MEDIUM
- **Category**: Purpose & frequency (rare, first-time UX — a delight budget)
- **Estimated scope**: 1 component + its CSS block; ~30 lines.

## Problem

The loader is a rare, first-time interaction, so it is allowed (and benefits from) a longer,
more deliberate timeline than the UI's 300ms budget. Today it completes in ~960ms, which
reads as a flash: the six boot lines stream past in ~150ms intervals and the progress bar
barely climbs before the overlay fades. The six lines never get a moment to land, and the
final `> ready` line appears at 92% with only ~75ms of progress left, so there is no
deliberate "ready" beat before the fade.

Locations:

- `src/components/InitialLoader.tsx:36-48` — timing constants + `useEffect`:
  ```tsx
  const reduce = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  ...
  const duration = reduce.current ? 420 : 960;
  ...
  setLeaving(true);
  doneTimer = window.setTimeout(() => onDoneRef.current(), 260);
  ```
- `src/components/InitialLoader.tsx:14` — line reveal thresholds:
  ```tsx
  const THRESHOLDS = [0, 16, 34, 54, 74, 92];
  ```
- `src/index.css` — `initial-loader__bar-fill` transition `width 120ms linear` and
  `.initial-loader.is-leaving { opacity: 0; }` with a 260ms overlay transition.

## Target

Stretch the normal timeline to ~1.8s, with reduced motion at ~700ms, so each line gets
~180–260ms of room and the bar climbs at a readable pace. Keep the final `> ready`
line revealing at ~86% to leave a ~250ms "ready" beat before the fade, and stretch the
exit fade slightly so the hand-off into the page is unhurried but still under 2s total
visible time.

```tsx
// src/components/InitialLoader.tsx
const THRESHOLDS = [0, 10, 28, 48, 70, 86];
...
const duration = reduce.current ? 700 : 1800;
...
setLeaving(true);
doneTimer = window.setTimeout(() => onDoneRef.current(), 340);
```

CSS stays `linear` (progress is constant motion per AUDIT.md §2):

```css
/* src/index.css — initial-loader__bar-fill (unchanged shape, unchanged timing) */
.initial-loader__bar-fill {
  transition: width 120ms linear;
}
```

CSS overlay fade gains a slightly longer beat (only the number changes):

```css
/* src/index.css — .initial-loader */
.initial-loader { transition: opacity 340ms cubic-bezier(0.23, 1, 0.32, 1); }
```

## Repo conventions to follow

- Rare/first-time motion is allowed to exceed the 300ms UI budget (AUDIT.md §1, §2);
  this is a first-run moment, not a dropdown. Do not bring the UI duration table's
  150–250ms budgets to bear here.
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` is the repo's strong ease-out token
  (index.css already inlines it on `.initial-loader`); reuse, do not invent a curve.
- Reduced motion must stay gentler and shorter (AUDIT.md §6) — movement dropped, but a
  comprehension-level fade + bar still aids comprehension. Keep the 700ms value well
  below the normal 1800ms.
- Existing boot-plan code uses `sessionStorage` gating in `App.tsx`; do not alter it.

## Steps

1. Edit `src/components/InitialLoader.tsx:14` — replace `THRESHOLDS` array with
   `[0, 10, 28, 48, 70, 86]`.
2. Edit the rAF `tick` block — change `const duration = reduce.current ? 420 : 960;`
   to `const duration = reduce.current ? 700 : 1800;`.
3. Edit the completion branch — change the `doneTimer` delay from `260` to `340`.
4. Edit `src/index.css` — change `.initial-loader { transition: opacity 260ms … }`
   to `340ms`. Leave `.initial-loader__bar-fill { transition: width 120ms linear; }`
   untouched.
5. Leave reduced-motion block as-is (the `initial-loader { transition: opacity 120ms ease; }`
   rule is already shorter than normal).

## Boundaries

- Do NOT touch `src/App.tsx` or the `sessionStorage` gating.
- Do NOT change markup, line copy, or aria attributes.
- Do NOT animate layout properties (transform/opacity only) — already compliant;
  keep it that way.
- Do NOT add new dependencies or SVG artwork.
- If the component has drifted since commit `5d7abbb` (e.g. the `THRESHOLDS` name or
  the `reduce` ref changed), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` (tsc -b + vite build) passes with no new warnings;
  `npm run tsc`/lint if configured passes.
- **Feel check (slow motion)**: open the site in a fresh tab (or clear
  `sessionStorage.portfolio-booted`), run DevTools Animations → 10% speed, and confirm:
  - Each of the six lines holds on screen for a perceptible beat (≈180–260ms real time)
    before the next arrives.
  - The bar climbs steadily and does not stutter at 100%.
  - `> ready` is visible for ~250ms (≈25 real-time frames at 10% speed) before the
    fade even begins.
  - The total visible loader time is ~2.14s (1.8s run + 0.34s fade) and feels like a
    first-run ritual, not a hang.
- **Reduced motion**: enable "Reduce motion" in OS/DevTools Rendering panel; reload;
  confirm the sequence completes in ~1.04s (700 + 340) with the same line copy, no
  movement, and the opacity fade still aids comprehension (AUDIT.md §6).
- **Done when**: a first-time visitor's boot takes ~2.14s on a fast connection and no
  longer reads as an accidental flash in slow motion.

## Notes for the plan author

- One plan, one finding: the reported "too fast" speed. No other loader issues
  (colors, copy, gating) are in scope.
- If, on execution, the executor judges 1.8s too slow on real devices, the adjustment
  should be made to the single `duration` constant (keep reduce at ~39% of normal),
  not to individual thresholds.