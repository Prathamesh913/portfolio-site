import { useEffect, useRef } from "react";
import create, { meta } from "ascii-magic-art/pieces/plasma.js";

/* Plasma backdrop — ASCII Magic's "Sine Plasma" (MIT), re-coloured for the
   site. The piece is a 88×30 frame at 30fps; we draw it cover-fit on a canvas
   behind the page, tinted into the brand's orange family and kept faint.

   Dark mode keeps the solid block glyphs, where copper on black reads as
   ambient light. Light mode swaps them for a halftone dot ramp and a lighter,
   more saturated palette: the same field, read as printed ink on paper.
   The palette is derived from --primary at runtime. */

const FRAME_FPS = 15;
const SPEED = 0.6;
const ALPHA_DARK = 0.12;
const ALPHA_LIGHT = 0.18;
/** Cell width as a fraction of font size for JetBrains Mono. */
const CELL_RATIO = 0.6;
const ASPECT = 1 / CELL_RATIO;
/** Light mode trades the solid blocks for a halftone dot ramp: the same
    density, read as printed ink instead of a woven grid. */
const DOT_RAMP: Record<string, string> = { "░": "·", "▒": "·", "▓": "∙", "█": "•" };
const DOT_RE = /[░▒▓█]/g;
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

/** Collapse the rainbow into four copper tones around the brand hue. Drawing
    four inks instead of thirty-six lets whole runs of a row share one fill,
    which is what keeps a full-viewport redraw cheap. */
const TONES = 4;
function tintedPalette(source: Record<string, string>, baseHue: number, light: boolean) {
  const colors = Array.from({ length: TONES }, (_, i) =>
    light
      ? hslToHex(baseHue + 1 + i * 2.2, 64 + i * 3, 62 + i * 4)
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
    let cellW = 16;
    let cellH = 27;
    let offsetX = 0;
    let offsetY = 0;
    let ink = "#eeeeee";
    let toneColors: string[] = [];
    let toneIndex: Record<string, number> = {};
    let alpha = ALPHA_DARK;
    let dark = true;
    let elapsed = 0;
    let lastTick = 0;
    let raf = 0;
    let disposed = false;

    const readTheme = () => {
      const styles = getComputedStyle(canvas);
      ink = styles.color || ink;
      const channels = styles.color.match(/[\d.]+/g);
      // Ink is near-white on the dark theme, near-black on the light one.
      const isLightTheme = channels && channels.length >= 3
        ? (0.2126 * +channels[0] + 0.7152 * +channels[1] + 0.0722 * +channels[2]) / 255 < 0.5
        : false;
      dark = !isLightTheme;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cover the viewport with the piece's native 88×30 grid.
      cellW = Math.max(width / meta.cols, height / (meta.rows * ASPECT));
      cellH = cellW * ASPECT;
      offsetX = (width - meta.cols * cellW) / 2;
      offsetY = (height - meta.rows * cellH) / 2;
      ctx.font = `500 ${cellW / CELL_RATIO}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
    };

    const draw = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);
      const frame = drawPiece(seconds);
      const rows = frame.text.split("\n");
      if (!dark) for (let y = 0; y < rows.length; y++) rows[y] = rows[y].replace(DOT_RE, (g) => DOT_RAMP[g]);
      const colors = frame.color.split("\n");

      ctx.globalAlpha = alpha;
      for (let y = 0; y < rows.length; y++) {
        const text = rows[y];
        const colorRow = colors[y] ?? "";
        const baseline = offsetY + (y + 0.5) * cellH;
        const toneAt = (i: number) => toneIndex[colorRow[i]] ?? 0;
        let start = 0;
        for (let x = 1; x <= text.length; x++) {
          if (x === text.length || toneAt(x) !== toneAt(start)) {
            const run = text.slice(start, x);
            if (run.trim()) {
              ctx.fillStyle = toneColors[toneAt(start)] ?? ink;
              ctx.fillText(run, offsetX + start * cellW, baseline);
            }
            start = x;
          }
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
      if (motion.matches) draw(STILL_TIME);
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotionChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Re-layout once the mono face is in: cell widths assume its 0.6em advance.
    document.fonts?.ready.then(() => {
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
