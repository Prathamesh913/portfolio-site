// Bookshelf — Outside of Work → Books I've Read.
//
// The restored Framer covers standing on a shelf. Every book keeps its real
// cover, title and author; width follows the cover's true aspect ratio, while
// height and tilt come from fixed curated tables so the shelf reads as
// arranged rather than randomized. Hovering lifts a book a few pixels and
// nudges its neighbours aside, the way pulling a book off a shelf does.
// No book links are invented — the source had none.

import type { CSSProperties } from "react";
import { books } from "../../data/outsideOfWork";

// Unitless heights (× --shelf-unit) and small tilts, cycled by position.
const HEIGHTS = [9.7, 9.2, 9.95, 9.4, 9.75, 9.25, 9.85, 9.5, 9.1, 9.6, 9.8, 9.3, 9.65, 9.45, 9.55];
const TILTS = [0, -1.1, 0.5, 0, -0.6, 0.9, 0, -0.4, 0.7, 0, -0.9, 0.45, 0, 0.6, -0.5];

export function Bookshelf() {
  return (
    <div
      className="shelf-scroll"
      role="group"
      tabIndex={0}
      aria-label={`Books: scrollable shelf, ${books.length} covers`}
    >
      <div className="shelf" role="list">
        {books.map((book, i) => {
          const height = HEIGHTS[i % HEIGHTS.length];
          const ratio = book.w / book.h;
          return (
            <figure
              className="shelf-book"
              role="listitem"
              key={book.slug}
              style={
                {
                  "--book-w": (height * ratio).toFixed(3),
                  "--book-h": height.toFixed(3),
                  "--book-tilt": `${TILTS[i % TILTS.length]}deg`,
                } as CSSProperties
              }
            >
              <img
                className="shelf-book__cover"
                src={book.src}
                alt={`Cover of ${book.title} by ${book.author}`}
                width={book.w}
                height={book.h}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="shelf-book__caption">
                <span className="shelf-book__title">{book.title}</span>
                <span className="shelf-book__author">{book.author}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
