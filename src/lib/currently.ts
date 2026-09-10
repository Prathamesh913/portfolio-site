// Client for the Currently snapshot.
//
// Tries the serverless aggregator first (Vercel `/api/currently`, then the
// Netlify-functions path), and falls back to the curated snapshot in
// `src/data/currently.ts` when the endpoint is missing, slow, or errors —
// which is also the state before API keys are configured.

import { currentlyFallback, type CurrentlySnapshot } from "../data/currently";

const ENDPOINTS = ["/api/currently", "/.netlify/functions/currently"];
const TIMEOUT_MS = 9_000;

function isSnapshot(value: unknown): value is CurrentlySnapshot {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    ("watching" in v || "listening" in v || "reading" in v) &&
    typeof v.updatedAt === "string"
  );
}

async function tryEndpoint(url: string): Promise<CurrentlySnapshot | null> {
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

export async function fetchCurrently(): Promise<CurrentlySnapshot> {
  for (const url of ENDPOINTS) {
    const snapshot = await tryEndpoint(url);
    if (snapshot) return mergeWithFallback(snapshot);
  }
  return currentlyFallback;
}

/** Server sends null for any provider without credentials — keep the
 *  curated value for that card instead of blanking it. */
function mergeWithFallback(live: CurrentlySnapshot): CurrentlySnapshot {
  return {
    watching: live.watching ?? currentlyFallback.watching,
    listening: live.listening ?? currentlyFallback.listening,
    reading: live.reading ?? currentlyFallback.reading,
    updatedAt: live.updatedAt || currentlyFallback.updatedAt,
    sources: live.sources ?? currentlyFallback.sources,
  };
}

export { currentlyFallback };
