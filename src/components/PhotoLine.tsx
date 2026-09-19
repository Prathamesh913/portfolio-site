// Photos — Outside of Work → Photos.
//
// A small line of Polaroid prints hanging from a wire. The wire stays put while
// the prints travel along it, and each clip carries a warm light. Mouse drag,
// trackpad, touch and the arrow keys all move the line; hovering or focusing a
// print lets it swing gently from its clip.
//
// Only real source data is used — `photos` carries no captions, locations or
// dates, so the Polaroid foot stays blank and the images open the shared
// lightbox rather than a second viewer.

import { useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { Photo } from "../data/outsideOfWork";
import { ImageLightbox, useImageLightbox, type LightboxEntry } from "./ImageLightbox";
import { useInViewOnce } from "../lib/useInViewOnce";

// Fixed, hand-arranged tilt per print (never random), so the line looks hung
// rather than generated. Cycled if the collection grows.
const LINE_TILT = [-1.6, 1.2, -0.9, 1.8, -1.3, 1.0, -1.9, 1.5, -1.1];

export function PhotoLine({ photos }: { photos: Photo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragMoved = useRef(false);
  const momentumRef = useRef(0);
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const lightbox = useImageLightbox("oow-photo");

  useEffect(
    () => () => {
      if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
    },
    []
  );

  // Mouse-only drag-to-pan with a short momentum tail. Snapping is suspended
  // during the drag and coast, then restored so the line settles to a print on
  // its own. Touch keeps its native momentum and snapping. A drag also
  // suppresses the click that would open the lightbox on release.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    dragMoved.current = false;
    if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
    momentumRef.current = 0;
    track.style.scrollSnapType = "none";

    const startX = event.clientX;
    const startScroll = track.scrollLeft;
    let lastX = startX;
    let lastTime = performance.now();
    let velocity = 0; // px per ms
    track.classList.add("is-grabbing");

    const settle = () => {
      momentumRef.current = 0;
      track.style.scrollSnapType = "";
    };

    const onMove = (ev: PointerEvent) => {
      const now = performance.now();
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 6) dragMoved.current = true;
      const dt = Math.max(now - lastTime, 1);
      velocity = (ev.clientX - lastX) / dt;
      lastX = ev.clientX;
      lastTime = now;
      track.scrollLeft = startScroll - dx;
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      track.classList.remove("is-grabbing");
      window.setTimeout(() => {
        dragMoved.current = false;
      }, 0);

      if (reduced || Math.abs(velocity) < 0.25) {
        settle();
        return;
      }
      const max = track.scrollWidth - track.clientWidth;
      let v = Math.max(-2, Math.min(2, velocity)); // cap hard synthetic flicks
      const step = () => {
        v *= 0.93;
        track.scrollLeft = Math.max(0, Math.min(max, track.scrollLeft - v * 16));
        if (Math.abs(v) > 0.02) momentumRef.current = requestAnimationFrame(step);
        else settle();
      };
      momentumRef.current = requestAnimationFrame(step);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const entries: LightboxEntry[] = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    w: photo.w,
    h: photo.h,
  }));

  return (
    <>
      <div className={`oow-line${inView ? " is-in" : ""}`} ref={ref}>
        <span className="oow-line__wire" aria-hidden="true" />
        <div
          className="oow-line__track"
          ref={trackRef}
          role="list"
          tabIndex={0}
          aria-label={`Photos: ${photos.length} photographs on a line, drag or scroll sideways`}
          onPointerDown={onPointerDown}
        >
          {photos.map((photo, i) => (
            <div
              className="oow-line__item"
              role="listitem"
              key={photo.id}
              style={
                {
                  "--i": i,
                  "--tilt": `${LINE_TILT[i % LINE_TILT.length]}deg`,
                } as CSSProperties
              }
            >
              <span className="oow-line__clip" aria-hidden="true" />
              <figure className="polaroid">
                <button
                  type="button"
                  id={`oow-photo-${i}`}
                  className="polaroid__button"
                  aria-haspopup="dialog"
                  aria-label={`Open larger view: ${photo.alt}`}
                  onClick={() => {
                    if (!dragMoved.current) lightbox.open(i);
                  }}
                >
                  <span className="polaroid__paper">
                    <span className="polaroid__media">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        width={photo.w}
                        height={photo.h}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        ref={(el) => {
                          if (el && el.complete && el.naturalWidth > 0) {
                            el.classList.add("is-loaded");
                          }
                        }}
                        onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
                      />
                    </span>
                  </span>
                </button>
              </figure>
            </div>
          ))}
        </div>
      </div>

      {lightbox.index !== null && (
        <ImageLightbox
          entries={entries}
          index={lightbox.index}
          onClose={lightbox.close}
          onNavigate={lightbox.navigate}
        />
      )}
    </>
  );
}
