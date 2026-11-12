import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GITHUB_USERNAME,
  githubSample,
  type ContributionDay,
  type GithubActivitySnapshot,
} from "../data/github";
import { fetchGithubActivity } from "../lib/github";
import { useInViewOnce } from "../lib/useInViewOnce";
import { SplitFlapLabel } from "./objects/SplitFlapLabel";
import { Skeleton } from "skullet/react";

const CELL = 10; // square cell size at natural scale
const BASE_STEP = 13; // cell + gap at natural scale
const LABEL_H = 18;
// Cap how far squares grow so a wide card never turns them into blocks.
const MAX_SCALE = 1.8;
// Rough half-width of the widest tooltip, so it never clips at the board edge.
const TIP_INSET = 52;
// Top rows open the tooltip below the cell; the rest open it above.
const TIP_BELOW_ROWS = 2;

type Cursor = { col: number; row: number };

type Tip = {
  month: string;
  day: number;
  count: number;
  x: number;
  y: number;
  below: boolean;
};

function weekdayOf(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

function monthShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function dayOfMonth(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDate();
}

function countLabel(count: number): string {
  if (count === 0) return "no contributions";
  return `${count} contribution${count === 1 ? "" : "s"}`;
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

/** Honest unavailable state — shown when every GitHub source is unreachable,
 *  instead of the old seeded placeholder calendar. */
function GithubUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="github-error" role="alert">
      <p className="github-error__title">GitHub seems to be having a moment</p>
      <p className="github-error__body">
        Give it another shot, or take a peek at my GitHub profile.
      </p>
      <div className="github-error__actions">
        <button type="button" className="github-error__retry" data-cuelume-tap onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  );
}

export function GithubActivity() {
  const [data, setData] = useState<GithubActivitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  // Skullet swaps panes on reveal, remounting the scroller — a callback ref
  // keeps measuring the live element instead of the unmounted ghost.
  const setScrollRef = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el;
    setScrollEl(el);
  }, []);
  const [available, setAvailable] = useState<number | null>(null);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const { ref: cardRef, inView } = useInViewOnce<HTMLDivElement>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchGithubActivity().then((snapshot) => {
      if (cancelled) return;
      if (snapshot) {
        setData(snapshot);
      } else {
        setData(null);
        setFailed(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Track the card's inner width so the graph can fill it on desktop while
  // keeping square cells; narrow viewports fall back to natural size + scroll.
  useEffect(() => {
    if (!scrollEl) return;
    const measure = () => {
      const next = scrollEl.clientWidth;
      setAvailable((prev) => (prev != null && Math.abs(prev - next) < 0.5 ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [scrollEl]);

  // Layout geometry derives from the live data when present, else from the
  // skeleton sample so the loading shimmer is already full-size.
  const view = data ?? githubSample;
  const columns = view.weeks.length;
  const naturalWidth = columns > 1 ? columns * BASE_STEP - (BASE_STEP - CELL) : 0;

  const layout = useMemo(() => {
    let cell = CELL;
    let step = BASE_STEP;
    let width = naturalWidth;
    if (available != null && columns > 1 && available > naturalWidth) {
      const scale = Math.min(available / naturalWidth, MAX_SCALE);
      cell = Math.max(CELL, Math.round(CELL * scale));
      // Absorb the remaining width into the column gaps so the graph spans the
      // card exactly, without stretching the (square) cells out of shape.
      step = (available - cell) / (columns - 1);
      width = available;
    }
    const height = LABEL_H + 7 * step - (step - cell);
    return { cell, step, width, height };
  }, [available, columns, naturalWidth]);

  const monthLabels = useMemo(() => {
    const labels: { x: number; text: string }[] = [];
    let prevMonth = "";
    view.weeks.forEach((week, col) => {
      const first = week.days[0];
      if (!first) return;
      const month = monthShort(first.date);
      if (col > 0 && month !== prevMonth) labels.push({ x: col * layout.step, text: month });
      prevMonth = month;
    });
    return labels;
  }, [view, layout.step]);

  const streak = useMemo(() => (data ? currentStreak(data) : 0), [data]);
  const live = data?.source === "live";

  const openTip = useCallback((day: ContributionDay, x: number, y: number, below: boolean) => {
    const count = day.count;
    const content = {
      month: monthShort(day.date),
      day: dayOfMonth(day.date),
      count,
    };
    setTip({ ...content, x, y, below });
  }, []);

  // Keep the tooltip inside the visible slice of the board.
  const clampX = useCallback((x: number) => {
    const scroller = scrollRef.current;
    const left = scroller?.scrollLeft ?? 0;
    const width = scroller?.clientWidth ?? 0;
    const min = left + TIP_INSET;
    const max = Math.max(min, left + width - TIP_INSET);
    return Math.min(Math.max(x, min), max);
  }, []);

  const onCellEnter = useCallback(
    (event: React.MouseEvent<SVGRectElement>, day: ContributionDay) => {
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;
      const board = svg.getBoundingClientRect();
      const cell = event.currentTarget.getBoundingClientRect();
      const row = weekdayOf(day.date);
      const below = row < TIP_BELOW_ROWS;
      const y = cell.top - board.top;
      openTip(
        day,
        clampX(cell.left - board.left + cell.width / 2),
        below ? y + cell.height + 6 : y - 6,
        below
      );
    },
    [clampX, openTip]
  );

  const cells = useMemo(
    () =>
      view.weeks.flatMap((week, col) =>
        week.days.map((day) => {
          const row = weekdayOf(day.date);
          return (
            <rect
              key={day.date}
              x={col * layout.step}
              y={LABEL_H + row * layout.step}
              width={layout.cell}
              height={layout.cell}
              rx={2}
              className={`gh-l${day.level} gh-cell`}
              onMouseEnter={(event) => onCellEnter(event, day)}
            />
          );
        })
      ),
    [view, layout, onCellEnter]
  );

  const moveCursor = useCallback(
    (next: Cursor) => {
      if (!data) return;
      const week = data.weeks[next.col];
      if (!week) return;
      const day =
        week.days.find((d) => weekdayOf(d.date) === next.row) ?? week.days[week.days.length - 1];
      if (!day) return;
      const row = weekdayOf(day.date);
      const col = next.col;
      const below = row < TIP_BELOW_ROWS;
      const y = LABEL_H + row * layout.step;
      setCursor({ col, row });
      openTip(
        day,
        clampX(col * layout.step + layout.cell / 2),
        below ? y + layout.cell + 6 : y - 6,
        below
      );
      const scroller = scrollRef.current;
      if (!scroller) return;
      const cellLeft = col * layout.step;
      const cellRight = cellLeft + layout.cell;
      if (cellLeft < scroller.scrollLeft) scroller.scrollLeft = Math.max(0, cellLeft - 8);
      else if (cellRight > scroller.scrollLeft + scroller.clientWidth) {
        scroller.scrollLeft = cellRight - scroller.clientWidth + 8;
      }
    },
    [clampX, data, layout, openTip]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!data) return;
      const cols = data.weeks.length;
      if (cols === 0) return;
      const lastWeek = data.weeks[cols - 1];
      const latest = lastWeek.days[lastWeek.days.length - 1];
      const base = cursor ?? { col: cols - 1, row: latest ? weekdayOf(latest.date) : 6 };
      let { col, row } = base;
      switch (event.key) {
        case "ArrowLeft":
          col = Math.max(0, col - 1);
          break;
        case "ArrowRight":
          col = Math.min(cols - 1, col + 1);
          break;
        case "ArrowUp":
          row = Math.max(0, row - 1);
          break;
        case "ArrowDown":
          row = Math.min(6, row + 1);
          break;
        default:
          return;
      }
      event.preventDefault();
      moveCursor({ col, row });
    },
    [cursor, data, moveCursor]
  );

  const dismiss = useCallback(() => {
    setCursor(null);
    setTip(null);
  }, []);

  return (
    <section className="github section-frame" id="activity" aria-label="GitHub activity">
      <div className="currently-head">
        <h2>Activity</h2>
        <p className="currently-updated" aria-live="polite">
          {loading
            ? "Checking GitHub…"
            : failed || !data
              ? "Data not available from GitHub"
              : `${data.totalContributions.toLocaleString()} contributions${streak > 0 ? ` · ${streak}-day streak` : ""}`}
        </p>
      </div>
      <div className={`github-card${inView ? " is-in" : ""}`} ref={cardRef}>
        <div className="github-card__head">
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
          >
            @{GITHUB_USERNAME} ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
          {data && (
            <span
              className={`currently-badge${live ? " is-live" : ""}`}
              title={live ? "Live from GitHub" : "Snapshot — add GITHUB_TOKEN for live data"}
            >
              <span aria-hidden="true">{live ? "●" : "○"}</span> {live ? "live" : "snapshot"}
            </span>
          )}
        </div>
        {/* Skullet: real data or an unavailable state — the sample only
            measures the grid's true size while loading, it is never data. */}
        <Skeleton
          data={data}
          sample={githubSample}
          id="github-activity"
          label="Loading GitHub activity"
          error={failed && !loading ? <GithubUnavailable onRetry={() => setReloadKey((k) => k + 1)} /> : undefined}
        >
        {() => (
          <div
            className="github-scroll"
            ref={setScrollRef}
            tabIndex={0}
            role="img"
            aria-label={`${view.totalContributions.toLocaleString()} contributions in the last year by ${view.username}. Use the arrow keys to inspect individual days.`}
            onKeyDown={onKeyDown}
            onBlur={dismiss}
          >
          <div className="github-canvas" style={{ width: layout.width, height: layout.height }}>
            <svg
              className="github-svg"
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              aria-hidden="true"
              onMouseLeave={() => setTip(null)}
            >
              {monthLabels.map((label, i) => (
                <SplitFlapLabel
                  key={`${label.x}-${label.text}`}
                  x={label.x}
                  index={i}
                  maxX={layout.width}
                  text={label.text.toUpperCase()}
                />
              ))}
              {cells}
            </svg>
            {cursor && (
              <span
                className="github-cursor"
                aria-hidden="true"
                style={{
                  width: layout.cell,
                  height: layout.cell,
                  transform: `translate(${cursor.col * layout.step}px, ${LABEL_H + cursor.row * layout.step}px)`,
                }}
              />
            )}
            {tip && (
              <span
                className={`github-tip${tip.below ? " is-below" : ""}`}
                style={{ left: tip.x, top: tip.y }}
                aria-hidden="true"
              >
                <span className="github-tip__date">
                  {tip.month.toUpperCase()} {tip.day}
                </span>
                <span className="github-tip__count">{countLabel(tip.count)}</span>
              </span>
            )}
          </div>
          </div>
        )}
        </Skeleton>
        <p className="sr-only" role="status">
          {tip ? `${tip.month} ${tip.day}, ${countLabel(tip.count)}` : ""}
        </p>
        <div className="github-foot">
          <span className="github-updated">{data ? `Updated ${data.updatedAt}` : loading ? "Checking for updates…" : "No updates available"}</span>
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
