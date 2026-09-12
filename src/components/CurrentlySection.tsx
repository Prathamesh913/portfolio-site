import { useEffect, useState } from "react";
import { currentlyFallback, type CurrentlySnapshot } from "../data/currently";
import { fetchCurrently } from "../lib/currently";

const REFRESH_MS = 60_000;

function SourceBadge({ source, liveLabel }: { source: "live" | "snapshot"; liveLabel: string }) {
  const live = source === "live";
  return (
    <span className={`currently-badge${live ? " is-live" : ""}`} title={live ? `Live from ${liveLabel}` : "Curated snapshot — connect the API for live data"}>
      <span aria-hidden="true">{live ? "●" : "○"}</span> {live ? "live" : "snapshot"}
    </span>
  );
}

function CardShell({ label, source, liveLabel, href, linkLabel, children }: {
  label: string;
  source: "live" | "snapshot";
  liveLabel: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="currently-card">
      <div className="currently-card__head">
        <h3>{label}</h3>
        <SourceBadge source={source} liveLabel={liveLabel} />
      </div>
      {children}
      {href && (
        <p className="currently-link">
          <a href={href} target="_blank" rel="noreferrer">
            {linkLabel} ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}
    </article>
  );
}

export function CurrentlySection() {
  const [data, setData] = useState<CurrentlySnapshot>(currentlyFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const snapshot = await fetchCurrently();
      if (!cancelled) {
        setData(snapshot);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const anyLive = Object.values(data.sources).some((s) => s === "live");

  return (
    <section className="currently section-frame" id="currently" aria-label="Currently">
      <div className="currently-head">
        <h2>Currently</h2>
        <p className="currently-updated" aria-live="polite">
          {loading ? "Checking live sources…" : anyLive ? `Live · updated ${data.updatedAt}` : `Snapshot · ${data.updatedAt}`}
        </p>
      </div>
      <div className="currently-grid">
        <CardShell label="Watching" source={data.sources.trakt} liveLabel="Trakt" href={data.watching?.url} linkLabel="Trakt">
          {data.watching ? (
            <>
              <p className="currently-title">{data.watching.title}</p>
              <p className="currently-meta">
                {[data.watching.kind === "show" ? "series" : "film", data.watching.detail, data.watching.year]
                  .filter(Boolean)
                  .join(" · ")}
                {data.watching.isNow ? " · watching now" : ""}
              </p>
            </>
          ) : (
            <p className="currently-empty">Nothing on the watch log yet.</p>
          )}
        </CardShell>

        <CardShell label="Listening" source={data.sources.spotify} liveLabel="Spotify" href={data.listening?.url} linkLabel="Spotify">
          {data.listening ? (
            <>
              <div className="currently-track">
                {data.listening.albumArt && (
                  <img
                    className="currently-art"
                    src={data.listening.albumArt}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div>
                  <p className="currently-title">{data.listening.track}</p>
                  <p className="currently-meta">
                    {[data.listening.artist, data.listening.album].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {data.sources.spotify === "live" && (
                <p className="currently-meta">{data.listening.isPlaying ? "● playing now" : "❚❚ last played"}</p>
              )}
            </>
          ) : (
            <p className="currently-empty">Nothing on the turntable yet.</p>
          )}
        </CardShell>

        <CardShell label="Reading" source={data.sources.hardcover} liveLabel="Hardcover" href={data.reading?.url} linkLabel="Hardcover">
          {data.reading ? (
            <>
              <p className="currently-title">{data.reading.title}</p>
              <p className="currently-meta">{data.reading.author}</p>
              {typeof data.reading.progressPercent === "number" && (
                <div className="currently-progress">
                  <div className="currently-progress__track">
                    <div className="currently-progress__bar" style={{ width: `${Math.min(100, Math.max(0, data.reading.progressPercent))}%` }} />
                  </div>
                  <span>{data.reading.progressPercent}% read</span>
                </div>
              )}
            </>
          ) : (
            <p className="currently-empty">No book on the nightstand yet.</p>
          )}
        </CardShell>
      </div>
    </section>
  );
}
