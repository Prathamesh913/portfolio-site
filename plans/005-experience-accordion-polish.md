# 005 — Experience accordion: layout + motion polish

- **Status**: DONE
- **Commit**: ffd24a3
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility / Missed opportunities / Cohesion
- **Estimated scope**: `src/index.css` only; ~70 lines across the `.exp-*` block, the row entrance rules, and the mobile media query.

## Problem

The Experience rows already animate height via the `grid-template-rows: 0fr→1fr`
pattern, but several motion details are off, and the mobile trigger crowds the period
into the same right-aligned slot as the desktop layout:

1. **Chevron morph uses `ease`** (a hover/color timing) for a rotation that is a
   morphing-on-screen change.
   `src/index.css:683`
   ```css
   .exp-row__chevron {
     transition: rotate 200ms ease, color 150ms ease;
   }
   ```

2. **Open and close take the same 240ms**, so the collapse does not feel like the
   "system responding."
   `src/index.css:694-700`
   ```css
   .exp-row__panel {
     display: grid; grid-template-rows: 0fr;
     visibility: hidden;
     transition: grid-template-rows 240ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s linear 240ms;
   }
   .exp-row.is-open .exp-row__panel {
     grid-template-rows: 1fr;
     visibility: visible;
     transition: grid-template-rows 240ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s;
   }
   ```

3. **No press feedback** on the trigger button even though the whole head is the
   trigger — the hover affordance is there, but there is no `:active` response.
   `src/index.css:669`
   ```css
   .exp-row__trigger {
     transition: color 150ms ease, background 150ms ease;
   }
   ```

4. **Row entrances have no stagger** — the whole `.experience` section fades as one
   block, so six rows land simultaneously.

5. **Mobile keeps the period (date) right-aligned** next to the chevron, the same as
   desktop, instead of a date-left / accordion-control-right split.

## Target

### Chevron morph (strong ease-in-out, AUDIT.md §2)

```css
/* src/index.css:683 */
.exp-row__chevron {
  transition: rotate 200ms cubic-bezier(0.77, 0, 0.175, 1), color 150ms ease;
}
```

### Asymmetric accordion timing (open ~240ms, close ~180ms, both ease-out)

```css
/* src/index.css:694 */
.exp-row__panel {
  display: grid; grid-template-rows: 0fr;
  visibility: hidden;
  transition: grid-template-rows 180ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s linear 180ms;
}
/* src/index.css:699 */
.exp-row.is-open .exp-row__panel {
  grid-template-rows: 1fr;
  visibility: visible;
  transition: grid-template-rows 240ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s;
}
```

### Press feedback (subtle, under 160ms per AUDIT.md §3)

```css
/* src/index.css:669 */
.exp-row__trigger {
  transition: color 150ms ease, background 150ms ease,
              transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}
.exp-row__trigger:active { transform: scale(0.97); }
```

### Staggered row entrances (30–80ms per AUDIT.md §7)

Add to the base `.exp-row` so motion matches the section's scroll-in without
fighting it. Entries themselves animate opacity + a small translate (position
change on an entrance is appropriate); the global reduced-motion rule still
collapses every duration to 0.01ms.

```css
/* src/index.css — after .exp-row:first-child */
.experience .exp-row {
  opacity: 0;
  translate: 0 8px;
  transition: opacity 360ms cubic-bezier(0.23, 1, 0.32, 1),
              translate 360ms cubic-bezier(0.23, 1, 0.32, 1);
}
.experience.reveal.is-inview .exp-row { opacity: 1; translate: 0 0; }
.experience.reveal.is-inview .exp-row:nth-child(2) { transition-delay: 40ms; }
.experience.reveal.is-inview .exp-row:nth-child(3) { transition-delay: 80ms; }
.experience.reveal.is-inview .exp-row:nth-child(4) { transition-delay: 120ms; }
.experience.reveal.is-inview .exp-row:nth-child(5) { transition-delay: 160ms; }
.experience.reveal.is-inview .exp-row:nth-child(6) { transition-delay: 200ms; }
```

### Panel content reveal (opacity, on open only)

```css
/* src/index.css — .exp-row__panel-inner */
.exp-row__panel-inner {
  overflow: hidden; min-height: 0;
  opacity: 0; translate: 0 4px;
  transition: opacity 120ms ease, translate 120ms ease;
}
.exp-row.is-open .exp-row__panel-inner {
  opacity: 1; translate: 0 0;
  transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1) 80ms,
              translate 200ms cubic-bezier(0.23, 1, 0.32, 1) 80ms;
}
```

### Mobile layout — date on the left, accordion control on the right

Extend the existing mobile media query. Period stops being pushed right and
becomes the first item on its line; the role wraps below; the chevron is pushed
to the far right.

```css
/* src/index.css — inside @media (max-width: 700px) */
.exp-period { order: -1; margin-left: 0; margin-right: auto; }
.exp-row__role { flex-basis: 100%; order: 0; }
.exp-row__chevron { order: 1; margin-left: auto; }
```

(No markup change: the flex container already wraps, so ordering alone reflows.)

## Repo conventions to follow

- Easing values copied from AUDIT.md §2: strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`,
  strong ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` — there are no CSS tokens for
  these in this repo; inline them exactly.
- Stagger budget 30–80ms/step (200ms total across six rows) per AUDIT.md §7; the
  staged delay only applies while entering the viewport and never blocks interaction.
- Press feedback kept inside the 100–160ms budget per AUDIT.md §3.
- Reduced motion is preserved by the global `prefers-reduced-motion` rule that
  collapses every transition to 0.01ms (do not add a second, weaker rule).
- The existing `grid-template-rows` height pattern stays; the panel math is the
  supported path here and `grid-template-rows` animating is a layout transition
  we are not attempting to replace with a transform.

## Steps

1. `src/index.css:683` — chevron transition swap (`ease` → strong ease-in-out) for
   the rotate property; color stays `ease`.
2. `src/index.css:669` — add `transform` to the trigger's transition list and add
   `.exp-row__trigger:active { transform: scale(0.97); }`.
3. `src/index.css:694-700` — split panel timing so close is 180ms and open is
   240ms, both cubic-bezier(0.23, 1, 0.32, 1); keep the visibility rule.
4. `src/index.css` — append the row and panel-content reveal rules (opacity +
   translate) with the 40/80/120/160/200ms nth-child delays.
5. `src/index.css` — inside `@media (max-width: 700px)`, add the three `order`
   declarations so the period sits left and the chevron sits right on mobile.
6. Review diff to confirm no markup, tokens, or JS changed (index.css only).

## Boundaries

- Do NOT touch `src/App.tsx` (including `ExperienceRow`) — CSS-only reflow and
  motion changes.
- Do NOT change markup or ARIA attributes.
- Do NOT replace the `grid-template-rows` height mechanism with a transform-based
  one (would rebuild the state machine for no feel gain — plan 003 already settled
  this pattern).
- Do NOT add new dependencies.
- If any selector's current CSS differs from the excerpt above (for example, a later
  loader-related edit touched this block), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` (tsc -b + vite build) passes; no new warnings.
  Diff is confined to `src/index.css`.
- **Feel check (slow motion)**: DevTools Animations → 10% playback:
  - Chevron rotates on a strong ease-in-out (no sluggish `ease` ramp).
  - Closing an open row takes visibly less time than opening.
  - Pressing and holding a trigger scales it to ~0.97 and releases on lift.
  - Six rows enter with a visible 40–200ms stagger as the section scrolls in.
  - Panel body fades/slides in ~80ms after the height starts expanding, and fades
    out promptly on collapse.
  - On a 390px viewport, the date (period) sits top-left and the chevron top-right,
    with the role/org wrapping beneath.
- **Reduced motion**: enable Reduce Motion; reload; confirm all entry/height/rotate
  motion is effectively instant while opacity still snaps for comprehension.
- **Done when**: opening/closing an Experience accordion reads as an interruptible,
  asymmetric, origin-correct interaction on both desktop and mobile, with the
  Experience rows staggered on first reveal.

## Notes for the plan author

- Findings merged because they all live in the same ~40-line `.exp-*` block; running
  them as separate plans would have executors stomping on overlapping lines.
- The stagger delays assume six Experience entries. If the count changes, keep the
  40ms step and drop the trailing nth-child rules instead of compressing the ramp.
- Mobile reflow relies on the trigger being `flex-wrap: wrap` (it is, via
  `.exp-row__trigger { flex-wrap: wrap; }`); keep that rule in place.