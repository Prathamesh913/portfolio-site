// Client for the Recently Watched section.
//
// The portfolio never calls Trakt directly — this hits the serverless
// endpoint (which holds the OAuth tokens), falling back to the Netlify
// functions path. Returns null when the section should stay hidden.

export type RecentMovie = {
  type: "movie";
  title: string;
  year?: number;
  watchedAt: string;
  poster?: string;
  traktUrl?: string;
};

export type RecentEpisode = {
  type: "episode";
  showTitle: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
  watchedAt: string;
  poster?: string;
  traktUrl?: string;
};

export type RecentItem = RecentMovie | RecentEpisode;

export type RecentSnapshot = {
  items: RecentItem[];
  profileUrl?: string;
  updatedAt: string;
  source: "live" | "cached" | "empty";
};

type Endpoint = { url: string; imageBase?: string };

const ENDPOINTS: Endpoint[] = [
  { url: "/api/trakt/recent" },
  { url: "/.netlify/functions/trakt-recent", imageBase: "/.netlify/functions/trakt-image" },
];

const TIMEOUT_MS = 9_000;

function isItem(value: unknown): value is RecentItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.type === "movie") return typeof v.title === "string" && typeof v.watchedAt === "string";
  if (v.type === "episode")
    return typeof v.showTitle === "string" && typeof v.watchedAt === "string";
  return false;
}

function parseSnapshot(value: unknown, imageBase?: string): RecentSnapshot | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.items)) return null;
  const items = v.items.filter(isItem).map((item) => {
    if (!item.poster || !imageBase) return item;
    return { ...item, poster: item.poster.replace("/api/trakt/image", imageBase) };
  });
  return {
    items,
    profileUrl: typeof v.profileUrl === "string" ? v.profileUrl : undefined,
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    source: v.source === "live" || v.source === "cached" ? v.source : "empty",
  };
}

async function tryEndpoint(endpoint: Endpoint): Promise<RecentSnapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint.url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return parseSnapshot(await res.json(), endpoint.imageBase);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRecentWatched(): Promise<RecentSnapshot | null> {
  for (const endpoint of ENDPOINTS) {
    const snapshot = await tryEndpoint(endpoint);
    if (snapshot && snapshot.items.length > 0) return snapshot;
  }
  return null;
}
