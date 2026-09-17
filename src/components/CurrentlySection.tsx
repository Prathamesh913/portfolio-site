import { useEffect, useState } from "react";
import { currentlyFallback, type CurrentlySnapshot } from "../data/currently";
import { fetchCurrently } from "../lib/currently";
import { pickWatchPoster, useRecentWatched } from "../lib/traktStore";
import { CRTScreen } from "./objects/CRTScreen";
import { ReadingBook } from "./objects/ReadingBook";
import { RecordPlayer } from "./objects/RecordPlayer";

const REFRESH_MS = 60_000;

function SourceBadge({ source, liveLabel }: { source: "live" | "snapshot"; liveLabel: string }) {
  const live = source === "live";
  return (
    <span className={`currently-badge${live ? " is-live" : ""}`} title={live ? `Live from ${liveLabel}` : "Curated snapshot — connect the API for live data"}>
      <span aria-hidden="true">{live ? "●" : "○"}</span> {live ? "live" : "snapshot"}
    </span>
  );
}

function CardShell({ label, source, liveLabel, href, linkLabel, state, children }: {
  label: string;
  source: "live" | "snapshot";
  liveLabel: string;
  href?: string;
  linkLabel?: string;
  state?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="currently-card">
      <div className="currently-card__head">
        <h3>{label}</h3>
        <SourceBadge source={source} liveLabel={liveLabel} />
      </div>
      {children}
      <div className="currently-foot">
        <span className="currently-state">{state}</span>
        {href && (
          <a className="currently-link" href={href} target="_blank" rel="noreferrer">
            {linkLabel} ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
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
  // One shared Trakt source: the latest item in Recently Watched supplies the
  // Watching artwork (and is reused verbatim when the titles match).
  const { snapshot: recent } = useRecentWatched();
  const latestRecent = recent?.items[0] ?? null;

  const listeningLive = data.sources.spotify === "live";
  const reading = data.reading;
  const progressPercent =
    typeof reading?.progressPercent === "number"
      ? Math.min(100, Math.max(0, Math.round(reading.progressPercent)))
      : null;

  return (
    <section className="currently section-frame" id="currently" aria-label="Currently">
      <div className="currently-head">
        <h2>Currently</h2>
        <p className="currently-updated" aria-live="polite">
          {loading ? "Checking live sources…" : anyLive ? `Live · updated ${data.updatedAt}` : `Snapshot · ${data.updatedAt}`}
        </p>
      </div>
      <div className="currently-grid">
        <CardShell
          label="Watching"
          source={data.sources.trakt}
          liveLabel="Trakt"
          href={data.watching?.url}
          linkLabel="Trakt"
          state={data.watching?.isNow ? "● watching now" : undefined}
        >
          {data.watching ? (
            <>
              <div className="currently-object">
                <CRTScreen
                  poster={pickWatchPoster(latestRecent, data.watching.title, data.watching.poster)}
                  title={data.watching.title}
                  live={data.sources.trakt === "live"}
                />
              </div>
              <p className="currently-title">{data.watching.title}</p>
              <p className="currently-meta">
                {[data.watching.kind === "show" ? "series" : "movie", data.watching.detail, data.watching.year]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          ) : (
            <p className="currently-empty">Nothing on the watch log yet.</p>
          )}
        </CardShell>

        <CardShell
          label="Listening"
          source={data.sources.spotify}
          liveLabel="Spotify"
          href={data.listening?.url}
          linkLabel="Spotify"
          state={listeningLive ? (data.listening?.isPlaying ? "● playing now" : "❚❚ last played") : undefined}
        >
          {data.listening ? (
            <>
              <div className="currently-object">
                <RecordPlayer
                  art={data.listening.albumArt}
                  album={data.listening.album}
                  playing={data.listening.isPlaying === true}
                />
              </div>
              <p className="currently-title">{data.listening.track}</p>
              <p className="currently-meta">
                {[data.listening.artist, data.listening.album].filter(Boolean).join(" · ")}
              </p>
              <p className="sr-only">
                {data.listening.isPlaying ? "This track is playing now." : "This track is not currently playing."}
              </p>
            </>
          ) : (
            <p className="currently-empty">Nothing on the turntable yet.</p>
          )}
        </CardShell>

        <CardShell
          label="Reading"
          source={data.sources.hardcover}
          liveLabel="Hardcover"
          href={reading?.url}
          linkLabel="Hardcover"
          state={progressPercent !== null ? `${progressPercent}% read` : undefined}
        >
          {reading ? (
            <>
              <div className="currently-object">
                <ReadingBook title={reading.title} author={reading.author} progress={reading.progressPercent} />
              </div>
              <p className="currently-title">{reading.title}</p>
              <p className="currently-meta">{reading.author}</p>
            </>
          ) : (
            <p className="currently-empty">No book on the nightstand yet.</p>
          )}
        </CardShell>
      </div>
    </section>
  );
}
