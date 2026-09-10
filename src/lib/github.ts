// Client for the GitHub activity snapshot.
//
// Resolution order:
//   1. Serverless proxy (Vercel `/api/github`, then the Netlify-functions
//      path) — official GraphQL calendar, needs GITHUB_TOKEN server-side.
//   2. Public contributions proxy — real GitHub data, no token needed.
//   3. Seeded placeholder in `src/data/github.ts` — only when both are
//      unreachable, badged "snapshot" in the UI.

import {
  githubFallback,
  type ContributionLevel,
  type ContributionWeek,
  type GithubActivitySnapshot,
} from "../data/github";

const ENDPOINTS = ["/api/github", "/.netlify/functions/github"];
const TIMEOUT_MS = 9_000;

function isSnapshot(value: unknown): value is GithubActivitySnapshot {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.weeks) && typeof v.updatedAt === "string";
}

async function tryEndpoint(url: string): Promise<GithubActivitySnapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return isSnapshot(json) ? json : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type ProxyDay = { date?: unknown; count?: unknown; level?: unknown };

function clampLevel(value: unknown): ContributionLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : 0;
}

function isProxyDay(day: ProxyDay): day is { date: string; count: number; level: ContributionLevel } {
  return (
    typeof day.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    typeof day.count === "number" &&
    Number.isFinite(day.count)
  );
}

/** Map the public proxy payload onto the snapshot shape the UI renders. */
function snapshotFromProxy(
  username: string,
  payload: unknown,
  updatedAt: string
): GithubActivitySnapshot | null {
  if (typeof payload !== "object" || payload === null) return null;
  const list = (payload as { contributions?: unknown }).contributions;
  if (!Array.isArray(list) || list.length === 0) return null;

  const weeks: ContributionWeek[] = [];
  for (let i = 0; i < list.length; i += 7) {
    const days = (list.slice(i, i + 7) as ProxyDay[])
      .filter(isProxyDay)
      .map((d) => ({ date: d.date, count: d.count, level: clampLevel(d.level) }));
    if (days.length > 0) weeks.push({ days });
  }
  if (weeks.length === 0) return null;

  const counted = weeks.flatMap((w) => w.days).reduce((sum, d) => sum + d.count, 0);
  const reported = (payload as { total?: { lastYear?: unknown } }).total?.lastYear;
  const totalContributions = typeof reported === "number" && Number.isFinite(reported) ? reported : counted;

  return { username, totalContributions, weeks, updatedAt, source: "live" };
}

async function tryPublicProxy(username: string): Promise<GithubActivitySnapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      { signal: controller.signal, headers: { accept: "application/json" } }
    );
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return snapshotFromProxy(username, json, new Date().toISOString().slice(0, 10));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchGithubActivity(): Promise<GithubActivitySnapshot> {
  for (const url of ENDPOINTS) {
    const snapshot = await tryEndpoint(url);
    // The endpoint answers 200 with empty weeks when the token is missing —
    // treat that as "try the next source", not as a final answer.
    if (snapshot && snapshot.weeks.length > 0) return snapshot;
  }
  const proxy = await tryPublicProxy(githubFallback.username);
  if (proxy) return proxy;
  return githubFallback;
}

export { githubFallback };
