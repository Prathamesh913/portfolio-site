// ReadingBook — Currently → Reading.
//
// A physical hardback: page block with a visible fore-edge, spine sliver with a
// head band, hinge line, and a front cover carrying the book's real identity.
// When the book being read matches an entry in the shelf data, the real cover
// artwork is used; otherwise the real title and author are typeset on the
// cover — no invented artwork either way.
//
// The ribbon bookmark is attached at the spine head and its tip sits at the
// reader's progress, so 42% is a place in the book rather than a progress bar.

import { useId } from "react";
import { books } from "../../data/outsideOfWork";

const COVER = { x: 10, y: 8, w: 90, h: 118 };
const SPINE_HEAD = 15.5;
const RIBBON_TOP = 5;
const RIBBON_HALF = 2.3;

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

/** Word-wrap a title onto the cover, three lines at most. */
function wrapTitle(title: string, max = 12): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.toUpperCase().split(/\s+/)) {
    if (!line) line = word;
    else if ((line + " " + word).length <= max) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function ReadingBook({
  title,
  author,
  progress,
}: {
  title: string;
  author?: string;
  progress?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const coverClip = `book-cover-${uid}`;
  const pct =
    typeof progress === "number" ? Math.min(100, Math.max(0, Math.round(progress))) : null;
  const tip = COVER.y + ((pct ?? 0) / 100) * COVER.h;
  const realCover = books.find((book) => normalize(book.title) === normalize(title))?.src;

  const lines = wrapTitle(title);
  const lineHeight = 10.6;
  const blockHeight = lines.length * lineHeight;
  const titleTop = 58 - blockHeight / 2;
  const ruleY = titleTop + blockHeight + 9;
  const authorY = ruleY + 12;

  return (
    <span
      className="book"
      role="img"
      aria-label={`Book cover of ${title}${pct !== null ? `, ${pct}% read` : ""}`}
    >
      <svg className="book__svg" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={coverClip}>
            <rect x={COVER.x} y={COVER.y} width={COVER.w} height={COVER.h} rx="3" />
          </clipPath>
        </defs>

        {/* Shadow on the surface */}
        <rect className="book__shadow" x="12" y="14" width="92" height="122" rx="4" />

        {/* Page block: visible as the fore-edge and a sliver at the foot */}
        <path
          className="book__pages"
          d="M14 11 H104 a3 3 0 0 1 3 3 V127 a3 3 0 0 1 -3 3 H14 Z"
        />
        <g className="book__fore-edge">
          {[22, 40, 58, 76, 94, 112].map((y) => (
            <line key={y} x1="101.5" y1={y} x2="107" y2={y} />
          ))}
        </g>

        {/* Spine board behind the cover */}
        <path className="book__spine" d="M5 11 V123 a3 3 0 0 0 3 3 H13 V8 H8 a3 3 0 0 0 -3 3 Z" />
        <rect className="book__head-band" x="5" y="11" width="8" height="3.4" rx="1.2" />

        {/* Front cover */}
        <rect
          className="book__cover"
          x={COVER.x}
          y={COVER.y}
          width={COVER.w}
          height={COVER.h}
          rx="3"
        />
        {realCover ? (
          <image
            href={realCover}
            x={COVER.x}
            y={COVER.y}
            width={COVER.w}
            height={COVER.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${coverClip})`}
          />
        ) : (
          <g className="book__cover-type" clipPath={`url(#${coverClip})`}>
            <text textAnchor="middle">
              {lines.map((line, i) => (
                <tspan key={line + i} x="55" y={titleTop + i * lineHeight}>
                  {line}
                </tspan>
              ))}
            </text>
            <line className="book__cover-rule" x1="38" y1={ruleY} x2="72" y2={ruleY} />
            {author && (
              <text className="book__cover-author" x="55" y={authorY} textAnchor="middle">
                {author}
              </text>
            )}
          </g>
        )}
        <path className="book__hinge" d={`M18 ${COVER.y + 2} V${COVER.y + COVER.h - 2}`} />

        {/* Bookmark ribbon, attached at the spine head */}
        <path
          className="book__ribbon"
          d={`M${SPINE_HEAD - RIBBON_HALF} ${RIBBON_TOP} L${SPINE_HEAD + RIBBON_HALF} ${RIBBON_TOP} L${SPINE_HEAD + RIBBON_HALF} ${tip} L${SPINE_HEAD} ${tip - 4.2} L${SPINE_HEAD - RIBBON_HALF} ${tip} Z`}
        />
      </svg>
    </span>
  );
}
