// SplitFlapLabel — a single airport-board month label for the GitHub graph.
//
// Drawn as an SVG group so it can live inside the existing contribution
// matrix: panel, center seam and text. The flip-in animation is applied by
// the parent board (`.github-card.is-in`) and staggered per label; nothing
// keeps animating afterwards.

export function SplitFlapLabel({
  x,
  text,
  index,
  maxX,
}: {
  x: number;
  text: string;
  index: number;
  maxX: number;
}) {
  const width = text.length * 8 + 6;
  // Keep the panel inside the board — the last column sits at the right edge.
  const left = Math.max(1, Math.min(x - 3, maxX - width - 2));

  return (
    <g className="github-flap" style={{ animationDelay: `${index * 70}ms` }}>
      <rect className="github-flap__panel" x={left} y={1} width={width} height={16} rx={3} />
      <line
        className="github-flap__seam"
        x1={left + 0.5}
        y1={9}
        x2={left + width - 0.5}
        y2={9}
      />
      <text className="github-flap__text" x={left + width / 2} y={11.6} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}
