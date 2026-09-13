import { useEffect, useState } from "react";
import { fetchRecentWatched, type RecentItem, type RecentSnapshot } from "../lib/trakt";

function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  if (diffMs < 0) return "just now";
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    new Date(then)
  );
}

function episodeMeta(item: Extract<RecentItem, { type: "episode" }>): string {
  const parts: string[] = [];
  if (item.season != null && item.episode != null) {
    parts.push(`S${String(item.season).padStart(2, "0")} E${String(item.episode).padStart(2, "0")}`);
  }
  if (item.episodeTitle) parts.push(item.episodeTitle);
  return parts.join(" · ");
}

function titleOf(item: RecentItem): string {
  return item.type === "movie" ? item.title : item.showTitle;
}

function Card({ item }: { item: RecentItem }) {
  const title = titleOf(item);
  const meta = item.type === "episode" ? episodeMeta(item) : item.year ? String(item.year) : "";
  const alt = item.type === "movie" ? `Poster for ${item.title}` : `Poster for ${item.showTitle}`;

  const body = (
    <>
      <span className="recently-card__media">
        {item.poster ? (
          <img src={item.poster} alt="" loading="lazy" decoding="async" width={200} height={300} />
        ) : (
          <span className="recently-card__fallback" aria-hidden="true">
            {title.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="recently-card__body">
        <span className="recently-card__title">{title}</span>
        {meta && <span className="recently-card__meta">{meta}</span>}
        <span className="recently-card__time">{relativeTime(item.watchedAt)}</span>
      </span>
    </>
  );

  return (
    <article className="recently-card" role="listitem">
      {item.traktUrl ? (
        <a
          className="recently-card__link"
          href={item.traktUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${title}${meta ? `, ${meta}` : ""} on Trakt (opens in a new tab)`}
        >
          {body}
        </a>
      ) : (
        <div className="recently-card__link" aria-label={`${title}${meta ? `, ${meta}` : ""}`}>
          {body}
        </div>
      )}
    </article>
  );
}

function Skeleton() {
  return (
    <section className="oow-block oow-block--watching" aria-hidden="true">
      <div className="oow-block__head">
        <h3>Watching</h3>
      </div>
      <div className="recently-strip">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="recently-card" key={i}>
            <span className="recently-card__media recently-skeleton" />
            <span className="recently-card__body">
              <span className="recently-card__title recently-skeleton recently-skeleton--line" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecentlyWatched() {
  const [snapshot, setSnapshot] = useState<RecentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRecentWatched().then((data) => {
      if (cancelled) return;
      setSnapshot(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton />;
  if (!snapshot || snapshot.items.length === 0) return null;

  return (
    <section className="oow-block oow-block--watching" aria-labelledby="oow-watching">
      <div className="oow-block__head">
        <h3 id="oow-watching">Watching</h3>
        <p className="oow-block__meta">
          {snapshot.source === "cached" ? "Cached · " : ""}
          {snapshot.items.length} recent items
        </p>
      </div>
      <div
        className="recently-strip"
        role="list"
        tabIndex={0}
        aria-label={`Recently watched: scrollable list, ${snapshot.items.length} items`}
      >
        {snapshot.items.map((item) => (
          <Card item={item} key={`${item.type}-${item.watchedAt}-${titleOf(item)}`} />
        ))}
      </div>
      {snapshot.profileUrl && (
        <p className="recently-profile">
          <a href={snapshot.profileUrl} target="_blank" rel="noreferrer">
            View my Trakt ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}
    </section>
  );
}
