import { useEffect, useRef, useState } from "react";
import { RecentlyWatched } from "./RecentlyWatched";
import { books, photos, youtubeChannel, youtubeVideos } from "../data/outsideOfWork";
import type { Photo } from "../data/outsideOfWork";

function PhotoLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = items[index];
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate((index + 1) % items.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate((index - 1 + items.length) % items.length);
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button, [href], [tabindex]:not([tabindex='-1'])"
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
  }, [index, items.length, onClose, onNavigate]);

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-lightbox-title"
      onClick={onClose}
    >
      <div className="gallery-lightbox__panel" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div className="gallery-lightbox__bar">
          <p className="gallery-lightbox__count">
            {index + 1} / {items.length}
          </p>
          <button type="button" className="gallery-lightbox__btn" onClick={onClose} aria-label="Close larger view">
            Close ✕
          </button>
        </div>
        <img
          className="gallery-lightbox__img"
          src={item.src}
          alt={item.alt}
          width={item.w}
          height={item.h}
          decoding="async"
        />
        <p className="gallery-lightbox__desc" id="photo-lightbox-title">
          {item.alt}
        </p>
        <div className="gallery-lightbox__nav">
          <button
            type="button"
            className="gallery-lightbox__btn"
            onClick={() => onNavigate((index - 1 + items.length) % items.length)}
            aria-label={`Previous photo (${items[(index - 1 + items.length) % items.length].alt.slice(0, 60)}…)`}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="gallery-lightbox__btn"
            onClick={() => onNavigate((index + 1) % items.length)}
            aria-label={`Next photo (${items[(index + 1) % items.length].alt.slice(0, 60)}…)`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotosBlock() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = () => {
    if (lightboxIndex === null) return;
    const id = photos[lightboxIndex].id;
    setLightboxIndex(null);
    requestAnimationFrame(() => {
      document.getElementById(`photo-thumb-${id}`)?.focus();
    });
  };

  return (
    <section className="oow-block" aria-labelledby="oow-photos">
      <h3 id="oow-photos">Photos</h3>
      <div
        className="oow-photos"
        role="list"
        tabIndex={0}
        aria-label={`Photos: scrollable gallery, ${photos.length} photographs`}
      >
        {photos.map((photo, i) => (
          <figure className="oow-photo-card" role="listitem" key={photo.id}>
            <button
              type="button"
              id={`photo-thumb-${photo.id}`}
              className="oow-photo"
              aria-haspopup="dialog"
              aria-label={`Open larger view: ${photo.alt}`}
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                loading="lazy"
                decoding="async"
              />
            </button>
          </figure>
        ))}
      </div>
      {lightboxIndex !== null && (
        <PhotoLightbox
          items={photos}
          index={lightboxIndex}
          onClose={close}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}

function BooksBlock() {
  return (
    <section className="oow-block" aria-labelledby="oow-books">
      <h3 id="oow-books">Books I've Read</h3>
      <div className="oow-books" role="list" tabIndex={0} aria-label={`Books: scrollable shelf, ${books.length} covers`}>
        {books.map((book) => (
          <figure className="oow-book" role="listitem" key={book.slug}>
            <img
              src={book.src}
              alt={`Cover of ${book.title} by ${book.author}`}
              width={book.w}
              height={book.h}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="oow-book__title">{book.title}</span>
              <span className="oow-book__author">{book.author}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function YouTubeBlock() {
  return (
    <section className="oow-block" aria-labelledby="oow-youtube">
      <div className="oow-block__head">
        <h3 id="oow-youtube">My YouTube</h3>
        <a className="oow-block__link" href={youtubeChannel.url} target="_blank" rel="noreferrer">
          View my channel ↗<span className="sr-only">: {youtubeChannel.name} (opens in a new tab)</span>
        </a>
      </div>
      <p className="oow-block__note">Things I've made and shared.</p>
      <div className="oow-videos">
        {youtubeVideos.map((video) => (
          <a
            className="oow-video"
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="oow-video__media">
              <img
                src={video.thumbnail}
                alt=""
                width={video.w}
                height={video.h}
                loading="lazy"
                decoding="async"
              />
              <span className="oow-video__kind">{video.kind === "short" ? "Short" : "Video"}</span>
            </span>
            <span className="oow-video__body">
              {video.title ? (
                <span className="oow-video__title">{video.title}</span>
              ) : (
                <span className="oow-video__title oow-video__title--short">Short</span>
              )}
              {video.tags && (
                <span className="oow-video__tags">
                  {video.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </span>
              )}
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function OutsideOfWork() {
  return (
    <section className="outside-of-work section-frame" aria-label="Outside of work">
      <h2>Outside of Work</h2>
      <p className="oow-intro">
        A collection of things I enjoy outside of design — what I watch, photograph, read, and create.
      </p>

      <RecentlyWatched />

      <PhotosBlock />
      <BooksBlock />
      <YouTubeBlock />
    </section>
  );
}
