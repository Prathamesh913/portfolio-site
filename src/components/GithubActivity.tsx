import { useEffect, useMemo, useState } from "react";
import { githubFallback, type GithubActivitySnapshot } from "../data/github";
import { fetchGithubActivity } from "../lib/github";

const CELL = 10;
const STEP = 13; // cell + gap
const LABEL_H = 18;

function weekdayOf(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

function monthShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Consecutive active days ending with the dataset (allows ending yesterday). */
function currentStreak(data: GithubActivitySnapshot): number {
  const days = data.weeks.flatMap((w) => w.days);
  if (days.length === 0) return 0;
  let end = days.length - 1;
  if (days[end].count === 0) end -= 1;
  let streak = 0;
  for (let i = end; i >= 0 && days[i].count > 0; i--) streak += 1;
  return streak;
}

export function GithubActivity() {
  const [data, setData] = useState<GithubActivitySnapshot>(githubFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchGithubActivity().then((snapshot) => {
      if (!cancelled) {
        setData(snapshot);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { x: number; text: string }[] = [];
    let prevMonth = "";
    data.weeks.forEach((week, col) => {
      const first = week.days[0];
      if (!first) return;
      const month = monthShort(first.date);
      if (col > 0 && month !== prevMonth) labels.push({ x: col * STEP, text: month });
      prevMonth = month;
    });
    return labels;
  }, [data]);

  const streak = useMemo(() => currentStreak(data), [data]);
  const width = data.weeks.length * STEP - (STEP - CELL);
  const height = LABEL_H + 7 * STEP - (STEP - CELL);
  const live = data.source === "live";

  return (
    <section className="github section-frame" id="activity" aria-label="GitHub activity">
      <div className="currently-head">
        <h2>Activity</h2>
        <p className="currently-updated" aria-live="polite">
          {loading
            ? "Checking GitHub…"
            : `${data.totalContributions.toLocaleString()} contributions${streak > 0 ? ` · ${streak}-day streak` : ""}`}
        </p>
      </div>
      <div className="github-card">
        <div className="github-card__head">
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noreferrer"
          >
            @{data.username} ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span
            className={`currently-badge${live ? " is-live" : ""}`}
            title={live ? "Live from GitHub" : "Placeholder — add GITHUB_TOKEN for live data"}
          >
            <span aria-hidden="true">{live ? "●" : "○"}</span> {live ? "live" : "snapshot"}
          </span>
        </div>
        <div
          className="github-scroll"
          tabIndex={0}
          role="img"
          aria-label={`${data.totalContributions.toLocaleString()} contributions in the last year by ${data.username}`}
        >
          <svg
            className="github-svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
          >
            {monthLabels.map((label) => (
              <text key={`${label.x}-${label.text}`} x={label.x} y={11} className="github-month">
                {label.text}
              </text>
            ))}
            {data.weeks.flatMap((week, col) =>
              week.days.map((day) => (
                <rect
                  key={day.date}
                  x={col * STEP}
                  y={LABEL_H + weekdayOf(day.date) * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  className={`gh-l${day.level}`}
                >
                  <title>
                    {day.count === 0
                      ? `No contributions on ${formatDate(day.date)}`
                      : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                  </title>
                </rect>
              ))
            )}
          </svg>
        </div>
        <div className="github-foot">
          <span className="github-updated">Last year · updated {data.updatedAt}</span>
          <span className="github-legend">
            Less
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className={`gh-swatch gh-l${level}`} aria-hidden="true" />
            ))}
            More
          </span>
        </div>
      </div>
    </section>
  );
}
