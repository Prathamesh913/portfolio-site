import { useEffect, useRef } from "react";
import create, { meta } from "ascii-magic-art/pieces/plasma.js";

/* Plasma backdrop — ASCII Magic's "Sine Plasma" (MIT), re-coloured for the
   site. The piece is a 88×30 frame at 30fps; we draw it cover-fit on a canvas
   behind the page, tinted into the brand's copper family in dark mode and a
   cool graphite in light mode.

   Both themes draw the Devanagari mark प्र instead of the source blocks: the
   field becomes a drifting grid of the site's initial, one mark per source
   cell. Each mark keeps its original density as scale and opacity, and a slow
   per-glyph breath keeps the texture alive without competing with the page.
   Dark tones are derived from --primary; light tones stay neutral so the
   porcelain paper never reads as sepia. */

const FRAME_FPS = 15;
const SPEED = 0.6;
const ALPHA_DARK = 0.32;
const ALPHA_LIGHT = 0.25;
/** Cell width as a fraction of font size for JetBrains Mono. */
const CELL_RATIO = 0.6;
const ASPECT = 1 / CELL_RATIO;
/** The mark. Source density (░▒▓█) becomes glyph size plus opacity. */
const GLYPH = "प्र";
const GLYPH_FONT =
  '"Noto Sans Devanagari", "Nirmala UI", "Devanagari Sangam MN", system-ui, sans-serif';
const DENSITY: Record<string, number> = { "░": 0, "▒": 1, "▓": 2, "█": 3 };
/** Draw one mark every N cells; 1 keeps the full 88×30 weave. */
const GLYPH_STEP = 1;
/** Mark size as a fraction of its cell, kept small for a fine texture. */
const GLYPH_FIT = 0.62;
/** Source density ░▒▓█ → mark size and opacity, so the plasma's shape survives
    the swap from blocks to a single glyph. */
const SIZE_RAMP = [0.7, 0.8, 0.9, 1];
const ALPHA_RAMP = [0.32, 0.5, 0.74, 1];
/** Frame held for visitors who prefer reduced motion. */
const STILL_TIME = 2.6;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb | null {
  const m = hex.trim().match(/^#?([\da-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h / 6) * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (
    "#" +
    [f(0), f(8), f(4)]
      .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Collapse the rainbow into four inks: copper tones around the brand hue in
    dark mode, and neutral cool-greys in light mode so the field never adds a
    yellow cast to the porcelain paper. */
const TONES = 4;
function tintedPalette(source: Record<string, string>, baseHue: number, light: boolean) {
  const colors = Array.from({ length: TONES }, (_, i) =>
    light
      ? hslToHex(214, 5 + i * 1.5, 56 + i * 4.5)
      : hslToHex(baseHue + 2 + i * 2, 38 + i * 4, 29 + i * 6)
  );
  const index: Record<string, number> = {};
  for (const [key, hex] of Object.entries(source)) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      index[key] = 0;
      continue;
    }
    const [h] = rgbToHsl(rgb);
    index[key] = Math.min(TONES - 1, Math.floor((h / 360) * TONES));
  }
  return { colors, index };
}

export function PlasmaBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const drawPiece = create();

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cellW = 16;
    let cellH = 27;
    let offsetX = 0;
    let offsetY = 0;
    let inkW = 16;
    let inkH = 27;
    let ink = "#eeeeee";
    let toneColors: string[] = [];
    let toneIndex: Record<string, number> = {};
    /** One pre-rendered प्र per ink tone, so the frame draws images, not text. */
    let sprites: HTMLCanvasElement[] = [];
    let alpha = ALPHA_DARK;
    let elapsed = 0;
    let lastTick = 0;
    let raf = 0;
    let disposed = false;

    const readTheme = () => {
      const styles = getComputedStyle(canvas);
      ink = styles.color || ink;
      // The inline boot script always stamps data-theme; fall back to the OS.
      const theme = document.documentElement.dataset.theme;
      const isLightTheme = theme
        ? theme === "light"
        : window.matchMedia("(prefers-color-scheme: light)").matches;
      alpha = (isLightTheme ? ALPHA_LIGHT : ALPHA_DARK) * (window.innerWidth < 640 ? 0.7 : 1);

      const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      const rgb = hexToRgb(primary) ?? [236, 91, 43];
      const tinted = tintedPalette(meta.palette, rgbToHsl(rgb)[0], isLightTheme);
      toneColors = tinted.colors;
      toneIndex = tinted.index;
    };

    const layout = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cover the viewport with the piece's native 88×30 grid.
      cellW = Math.max(width / meta.cols, height / (meta.rows * ASPECT));
      cellH = cellW * ASPECT;
      offsetX = (width - meta.cols * cellW) / 2;
      offsetY = (height - meta.rows * cellH) / 2;
      inkW = cellW * GLYPH_STEP;
      inkH = cellH * GLYPH_STEP;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    /** Fit प्र inside one mark slot, once per tone, at device resolution. */
    const buildSprites = () => {
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return;

      let fontPx = inkH;
      for (let i = 0; i < 6; i++) {
        probe.font = `500 ${fontPx}px ${GLYPH_FONT}`;
        const m = probe.measureText(GLYPH);
        const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || fontPx;
        const fit = Math.min(1, (inkW * GLYPH_FIT) / (m.width || fontPx), (inkH * GLYPH_FIT) / glyphH);
        if (fit >= 0.995) break;
        fontPx *= fit;
      }

      const colors = toneColors.length ? toneColors : [ink];
      sprites = colors.map((color) => {
        const sprite = document.createElement("canvas");
        sprite.width = Math.max(1, Math.round(inkW * dpr));
        sprite.height = Math.max(1, Math.round(inkH * dpr));
        const g = sprite.getContext("2d");
        if (!g) return sprite;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = color;
        g.font = `500 ${fontPx}px ${GLYPH_FONT}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(GLYPH, inkW / 2, inkH / 2);
        return sprite;
      });
    };

    const draw = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!sprites.length) return;

      const frame = drawPiece(seconds);
      const rows = frame.text.split("\n");
      const colors = frame.color.split("\n");

      for (let y = 0; y < rows.length; y += GLYPH_STEP) {
        const text = rows[y];
        const colorRow = colors[y] ?? "";
        const centerY = offsetY + (y + GLYPH_STEP / 2) * cellH;
        for (let x = 0; x < text.length; x += GLYPH_STEP) {
          const density = DENSITY[text[x]];
          if (density === undefined) continue;
          const sprite = sprites[toneIndex[colorRow[x]] ?? 0] ?? sprites[0];
          if (!sprite) continue;
          // Slow, staggered breath: the field moves, the marks breathe with it.
          const pulse = 0.94 + 0.06 * Math.sin(seconds * 1.1 + x * 0.55 + y * 0.85);
          const w = inkW * SIZE_RAMP[density] * pulse;
          const h = inkH * SIZE_RAMP[density] * pulse;
          ctx.globalAlpha = alpha * ALPHA_RAMP[density];
          ctx.drawImage(sprite, offsetX + (x + GLYPH_STEP / 2) * cellW - w / 2, centerY - h / 2, w, h);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      const step = 1000 / FRAME_FPS;
      if (now - lastTick >= step) {
        elapsed += Math.min(now - lastTick, 250) / 1000;
        lastTick = now;
        draw(elapsed * SPEED);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (disposed || raf || document.hidden) return;
      lastTick = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const restart = () => {
      if (disposed) return;
      stop();
      layout();
      readTheme();
      buildSprites();
      if (motion.matches) {
        draw(STILL_TIME);
      } else {
        start();
      }
    };

    restart();

    const onResize = () => restart();
    const onVisibility = () =>
      document.hidden ? stop() : motion.matches ? undefined : start();
    const onMotionChange = () => restart();
    const observer = new MutationObserver(() => {
      readTheme();
      buildSprites();
      if (motion.matches) draw(STILL_TIME);
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotionChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Re-layout once the mono face and the Devanagari mark are in: cell widths
    // assume the mono advance, and the sprite needs its real metrics.
    const fonts = document.fonts;
    fonts?.load(`500 64px "Noto Sans Devanagari"`, GLYPH).catch(() => undefined);
    fonts?.ready.then(() => {
      if (!disposed && !document.hidden) restart();
    });

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotionChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
