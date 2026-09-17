import { useEffect, useRef, useState } from "react";

// Shared lightbox used by both the Archive gallery and case-study images.
// Each caller supplies its own entry set and trigger buttons, so navigation
// never crosses from one gallery/project into another.
export type LightboxEntry = {
  src: string;
  alt: string;
  w?: number;
  h?: number;
  title?: string;
  meta?: string;
  description?: string;
  details?: { label: string; text: string }[];
};

export function ImageLightbox({
  entries,
  index,
  onClose,
  onNavigate,
}: {
  entries: LightboxEntry[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const entry = entries[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasMany = entries.length > 1;
  const prevIndex = (index - 1 + entries.length) % entries.length;
  const nextIndex = (index + 1) % entries.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (hasMany && e.key === "ArrowRight") { e.preventDefault(); onNavigate(nextIndex); }
      else if (hasMany && e.key === "ArrowLeft") { e.preventDefault(); onNavigate(prevIndex); }
      else if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, entries.length, hasMany, prevIndex, nextIndex, onClose, onNavigate]);

  if (!entry) return null;

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer: ${entry.title ?? entry.alt}`}
      onClick={onClose}
    >
      <div className="gallery-lightbox__panel" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div className="gallery-lightbox__bar">
          {hasMany && <p className="gallery-lightbox__count">{index + 1} / {entries.length}</p>}
          <button type="button" className="gallery-lightbox__btn" onClick={onClose} aria-label="Close larger view">Close ✕</button>
        </div>
        <img
          className="gallery-lightbox__img"
          src={entry.src}
          alt={entry.alt}
          width={entry.w}
          height={entry.h}
          decoding="async"
        />
        {entry.title && <h3 className="gallery-lightbox__title">{entry.title}</h3>}
        {entry.meta && <p className="gallery-lightbox__meta">{entry.meta}</p>}
        {entry.description && <p className="gallery-lightbox__desc">{entry.description}</p>}
        {entry.details && entry.details.length > 0 && (
          <dl className="gallery-lightbox__points">
            {entry.details.map((point) => (
              <div key={point.label}>
                <dt>{point.label}</dt>
                <dd>{point.text}</dd>
              </div>
            ))}
          </dl>
        )}
        {hasMany && (
          <div className="gallery-lightbox__nav">
            <button
              type="button"
              className="gallery-lightbox__btn"
              onClick={() => onNavigate(prevIndex)}
              aria-label={`Previous: ${entries[prevIndex].title ?? entries[prevIndex].alt}`}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="gallery-lightbox__btn"
              onClick={() => onNavigate(nextIndex)}
              aria-label={`Next: ${entries[nextIndex].title ?? entries[nextIndex].alt}`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Manages open/index state and restores focus to the trigger button (matched by
// `${idPrefix}-${index}`) after the dialog closes.
export function useImageLightbox(idPrefix: string) {
  const [index, setIndex] = useState<number | null>(null);
  const close = () => {
    if (index === null) return;
    const opened = index;
    setIndex(null);
    requestAnimationFrame(() => document.getElementById(`${idPrefix}-${opened}`)?.focus());
  };
  return { index, open: (i: number) => setIndex(i), close, navigate: setIndex };
}
