// Client for the GitHub activity snapshot.
//
// Tries the serverless proxy first (Vercel `/api/github`, then the
// Netlify-functions path), and falls back to the placeholder snapshot in
// `src/data/github.ts` when the endpoint is missing, slow, or errors —
// which is also the state before GITHUB_TOKEN is configured.

import { githubFallback, type GithubActivitySnapshot } from "../data/github";

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

export async function fetchGithubActivity(): Promise<GithubActivitySnapshot> {
  for (const url of ENDPOINTS) {
    const snapshot = await tryEndpoint(url);
    if (snapshot) return mergeWithFallback(snapshot);
  }
  return githubFallback;
}

/** Server sends empty weeks when the token is missing — keep the
 *  placeholder instead of rendering an empty grid. */
function mergeWithFallback(live: GithubActivitySnapshot): GithubActivitySnapshot {
  if (!live.weeks || live.weeks.length === 0) return githubFallback;
  return live;
}

export { githubFallback };
