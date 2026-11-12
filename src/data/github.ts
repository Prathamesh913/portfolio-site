// GitHub activity — contribution-calendar snapshot.
//
// Data resolution lives in src/lib/github.ts: the token-backed endpoint
// (api/github.ts on Vercel, netlify/functions/github.mts on Netlify) first,
// then the token-free public proxy. Same shape throughout, so swapping
// sources needs no component changes. When no source answers, the client
// returns null and the UI shows "Data not available from GitHub" — there
// is no placeholder calendar to fall back on.
//
// `githubSample` below is NOT displayed data. It is only Skullet's `sample`
// prop: its counts/dates are never rendered as content, they exist solely
// so the loading skeleton measures the real grid's true 53×7 geometry and
// nothing shifts when live data arrives.

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type GithubActivitySnapshot = {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
  updatedAt: string;
  source: "live" | "snapshot";
};

/** Deterministic PRNG so the skeleton sample is stable across renders. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function levelFor(count: number, max: number): ContributionLevel {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4)) as ContributionLevel;
}

/** 53 Sunday-start week columns shaped like a real calendar (geometry only —
 *  counts are irrelevant, they are never displayed). */
function buildPlaceholderWeeks(todayIso: string): ContributionWeek[] {
  const rand = mulberry32(913);
  const today = new Date(`${todayIso}T00:00:00Z`);
  const sunday = new Date(today);
  sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
  const start = new Date(sunday);
  start.setUTCDate(start.getUTCDate() - 52 * 7);

  const counts: number[] = [];
  for (let i = 0; i < 53 * 7; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    if (d > today) {
      counts.push(-1); // future day: omitted below
      continue;
    }
    const r = rand();
    const weekday = d.getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    // Sparser weekends, occasional busy streaks — shaped like real activity.
    counts.push(
      r < (weekend ? 0.72 : 0.42) ? 0 : 1 + Math.floor(Math.pow(rand(), 2.2) * 14)
    );
  }
  const max = Math.max(1, ...counts);
  const weeks: ContributionWeek[] = [];
  for (let w = 0; w < 53; w++) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + w * 7 + d);
      const count = counts[w * 7 + d];
      if (count < 0) continue;
      days.push({
        date: date.toISOString().slice(0, 10),
        count,
        level: levelFor(count, max),
      });
    }
    weeks.push({ days });
  }
  return weeks;
}

export const GITHUB_USERNAME = "Prathamesh913";

const sampleWeeks = buildPlaceholderWeeks("2026-09-10");

export const githubSample: GithubActivitySnapshot = {
  username: GITHUB_USERNAME,
  totalContributions: sampleWeeks.flatMap((w) => w.days).reduce((sum, d) => sum + d.count, 0),
  weeks: sampleWeeks,
  updatedAt: "2026-09-10",
  source: "snapshot",
};
