# 003 — Rewrite CRT power as interruptible transitions with a composite-only line flash

- **Status**: DONE
- **Commit**: `da412c1`
- **Severity**: MEDIUM
- **Category**: Performance (also fixes Easing, Interruptibility; folds in Cohesion curve swap, reduced-motion comprehension fade, panel press feedback — all one state machine, see Notes)
- **Estimated scope**: 2 files, ~60 lines (`src/index.css`, `src/components/objects/CRTScreen.tsx`)

## Problem

The Samsung-style shutdown/startup (`src/index.css:1018-1034`, sequenced by `src/components/objects/CRTScreen.tsx:48-66`) has three compounding defects in one 30-line block:

**1. Paint-bound flash (Performance).** Both keyframes animate `filter: brightness(1→3)` on `.crt__tube` every frame, forcing paint on the whole tube subtree (snow tile, poster img, glass gradients) — the exact path that drops frames on mobile:

```css
/* src/index.css:1021-1034 — current */
.crt.is-on .crt__tube { animation: crt-expand 620ms cubic-bezier(0.25, 0.8, 0.3, 1); }
.crt.is-turning-off .crt__tube { animation: crt-collapse 480ms ease-in forwards; }
@keyframes crt-expand {
  0% { opacity: 1; filter: brightness(3); transform: scaleY(0.006); }
  32% { opacity: 1; filter: brightness(2.2); transform: scaleY(0.006); }
  62% { opacity: 1; filter: brightness(1.5); transform: scaleY(1.02); }
  100% { opacity: 1; filter: brightness(1); transform: scaleY(1); }
}
@keyframes crt-collapse {
  0% { opacity: 1; filter: brightness(1); transform: scaleY(1); }
  55% { opacity: 1; filter: brightness(3); transform: scaleY(0.006); }
  78% { opacity: 1; filter: brightness(3); transform: scaleY(0.006); }
  100% { opacity: 0; filter: brightness(3); transform: scaleY(0.006); }
}
```

**2. Backwards drain easing (Easing).** Collapse runs the `ease-in` keyword, so the squeeze eats 55% (~264ms) starting dead slow. A CRT drain should snap shut fast, hold the line, then fade.

**3. Non-interruptible toggle (Interruptibility).** Power is reversible mid-motion — `togglePower` (`src/components/objects/CRTScreen.tsx:48-66`) explicitly aborts a mid-collapse shutdown — but keyframes restart from zero, so aborting snaps the tube from line back to full instantly: a visible pop on a fast double-tap of the panel.

Smaller defects in the same block: the expand curve `cubic-bezier(0.25, 0.8, 0.3, 1)` near-duplicates the repo house ease-out `cubic-bezier(0.23, 1, 0.32, 1)` (used at `src/index.css:143,351,849`); reduced motion gets a hard cut with no comprehension fade; the panel button has no `:active` response.

## Target

Power states driven by **transitions** (retarget mid-flight — aborting a shutdown blooms smoothly back instead of popping), the white-hot flash moved to a dedicated **opacity-only line overlay** (composite-only, no per-frame paint), fast-attack drain timing, house curve on the bloom:

```css
/* target — replaces src/index.css:1018-1034 */
.crt__tube {
  position: absolute; inset: 0; display: block;
  transform-origin: center;
  transform: scaleY(0.006);
  opacity: 0;
  transition: transform 200ms cubic-bezier(0.5, 0, 0.75, 0), opacity 160ms ease-out 240ms, filter 240ms ease;
}
.crt.is-on .crt__tube {
  transform: scaleY(1);
  opacity: 1;
  transition: transform 340ms cubic-bezier(0.23, 1, 0.32, 1), opacity 120ms ease-out, filter 240ms ease;
}
/* White-hot line. Lives in .crt__screen (NOT inside .crt__tube) so it
   outlives the tube collapse; opacity-only, never filter. */
.crt__line {
  position: absolute; z-index: 3; left: 4%; right: 4%; top: 50%;
  display: block; height: 2px; margin-top: -1px;
  background: #fff;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.65);
  opacity: 0;
}
.crt.is-turning-off .crt__line { animation: crt-line-flash 400ms ease-out; }
.crt.is-on .crt__line { animation: crt-line-flash 520ms ease-out; }
@keyframes crt-line-flash {
  0% { opacity: 0; }
  18% { opacity: 1; }
  62% { opacity: 1; }
  100% { opacity: 0; }
}
```

Choreography this produces — shutdown: 200ms accelerating squeeze, line holds to 240ms, tube+line fade lands at 400ms. Startup: tube opacity snaps in 120ms, picture blooms over 340ms on the house curve, line flashes and is gone by 520ms. The drain curve `cubic-bezier(0.5, 0, 0.75, 0)` is an explicit accelerating squeeze for a physical energy drain, not a UI exit — do NOT "correct" it to ease-out.

## Repo conventions to follow

- House ease-out is `cubic-bezier(0.23, 1, 0.32, 1)` — exemplar `src/index.css:143`: `transition: opacity 400ms cubic-bezier(0.23, 1, 0.32, 1), translate 400ms cubic-bezier(0.23, 1, 0.32, 1);`
- Decorative layers are `aria-hidden` spans inside the object (`crt__static`, `crt__scanlines`) — the new `crt__line` follows the same pattern.
- JS/CSS timing contracts live as named constants with a comment — exemplar `src/components/objects/CRTScreen.tsx:20-21`: `// Matches the .crt__tube crt-collapse animation.` / `const COLLAPSE_MS = 480;`

## Steps

1. `src/index.css` — replace the block at lines 1018–1034 (comment + 2 animation declarations + `crt-expand` + `crt-collapse`) with the Target block above. Delete both old keyframes; nothing else may reference them.
2. `src/index.css` — the hover rule at line 1148 (`.crt__tube { transition: filter 240ms ease; }`) would clobber the base power transition on hover-capable devices (same specificity, later in file). Change it to the full base list: `.crt__tube { transition: transform 200ms cubic-bezier(0.5, 0, 0.75, 0), opacity 160ms ease-out 240ms, filter 240ms ease; }`. Leave line 1149 (`.crt:hover .crt__tube { filter: brightness(1.06); }`) untouched.
3. `src/index.css` — press feedback. `src/index.css:886-892`, the `.crt__body` rule has no transition; append `transition: transform 160ms ease-out;` to it and add `.crt__body:active { transform: translateY(1px); }` directly after the rule. (Body matches `:active` while the panel button is pressed; the button is its only interactive child.)
4. `src/index.css` — reduced motion (`src/index.css:1156-1170`): add `.crt__body` to the `transition: none` list; replace the tube lines (1166–1167) so the block reads:
   ```css
   .crt__tube,
   .crt.is-on .crt__tube { transition: opacity 200ms ease; }
   .crt__line { animation: none; opacity: 0; }
   ```
   (The `(0,2,0)` selector must tie-or-beat `.crt.is-on .crt__tube`; later-in-file wins the tie. Keep the existing `.crt.is-on .crt__static, .crt.is-on .crt__poster { animation: none; }` line as-is.) Net effect under reduced motion: instant tube park, 200ms opacity comprehension fade, no line flash.
5. `src/components/objects/CRTScreen.tsx` — inside `.crt__screen`, after the closing `</span>` of `.crt__tube` (line 95) and before `.crt__panel`, add nothing; instead add the line overlay INSIDE `.crt__screen` right after `.crt__tube`: `<span className="crt__line" aria-hidden="true" />`. (Sibling of the tube so it is not scaled by the tube's own collapse.)
6. `src/components/objects/CRTScreen.tsx` — retime the JS contract: `const COLLAPSE_MS = 480;` → `const COLLAPSE_MS = 400;` and update its comment to `// Matches the shutdown choreography: 200ms squeeze + 240ms line hold, fade lands at 400ms.`

## Boundaries

- Do NOT touch the snow (`crt-static-*`), poster (`crt-picture-in`), glass, scanlines, LED, grille, knob, or feet rules.
- Do NOT touch `CurrentlySection.tsx`, data files, or the `togglePower` logic itself (the `is-turning-off` class contract is unchanged).
- Do NOT add dependencies. Markup addition is limited to the single `crt__line` span from step 5.
- If any excerpt above doesn't match the code you find (drift since `da412c1`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` (runs `tsc -b && vite build`) completes clean.
- **Feel check** (desktop + a real phone, normal and 10%-speed via the DevTools Animations panel):
  - Power off: picture snaps shut fast (~200ms), bright line holds, everything gone by ~400ms. No sluggish squeeze.
  - Power on: line flashes, picture blooms to full in one motion (~340ms), poster fades in mid-bloom.
  - Spam the panel (tap mid-collapse, mid-bloom): the tube retargets smoothly every time — it never snaps or pops. (Known-minor: the 2px line itself may vanish instantly on abort — acceptable.)
  - Press-and-hold the panel: cabinet nudges down 1px, releases cleanly.
  - DevTools Rendering panel → `prefers-reduced-motion`: power on/off is a gentle ~200ms fade, zero movement, zero flash.
  - Keyboard: Tab to the panel button, Space toggles; focus ring visible.
- **Done when**: build is clean; shutdown reads as snap-shut/hold/vanish at full speed; no pop on any interruption sequence; reduced-motion path verified by eye.
