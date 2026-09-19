// ReadingBook — Currently → Reading.
//
// REAL cover hero. The actual cover artwork does the visual work — never a
// redrawn/reconstructed book, never title text typeset over an illustration:
//   1. `cover` prop (source-confirmed Hardcover edition image), else
//   2. a local bookshelf asset matched by title (same book, same cover), else
//   3. a quiet fallback panel (no fake book is drawn).
//
// The real cover is presented as one closed paperback resting on the card:
// front-facing with a ~2° tilt, a 3px page edge behind the fore-edge/foot, and
// a soft contact shadow. Progress lives in the "2% read" footer text — no
// ribbon, no bar, no overlay on the artwork. Calm: the only motion is a
// subtle lift on hover/focus. No fake pages, no continuous motion.

import { books } from "../../data/outsideOfWork";

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export function ReadingBook({
  title,
  author,
  cover,
}: {
  title: string;
  author?: string;
  progress?: number;
  cover?: string;
}) {
  // Data-driven, never hard-coded: live Hardcover artwork first, then a local
  // asset for the same title. Nothing is invented for the current book.
  const coverSrc = cover ?? books.find((book) => normalize(book.title) === normalize(title))?.src;

  return (
    <span className="book book--real">
      <span className="book__stage">
        {coverSrc ? (
          <>
            <span className="book__pages" aria-hidden="true" />
            <img
              className="book__cover"
              src={coverSrc}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="book__shadow" aria-hidden="true" />
          </>
        ) : (
          <span className="book__fallback" aria-hidden="true">
            <span className="book__fallback-title">{title}</span>
            {author && <span className="book__fallback-author">{author}</span>}
          </span>
        )}
      </span>
    </span>
  );
}
