// GET /api/trakt/recent — normalized, cached recent Trakt watch history.
//
// Auth: OAuth authorization-code tokens minted once via `npm run trakt:auth`
// and stored as env vars. The client secret and tokens never leave the server.
// Trakt requires BOTH `trakt-api-key` and `Authorization: Bearer` on
// authenticated calls; either alone is rejected.
//
// Env: TRAKT_CLIENT_ID, TRAKT_CLIENT_SECRET, TRAKT_USERNAME,
//      TRAKT_ACCESS_TOKEN, TRAKT_ACCESS_EXPIRES_AT, TRAKT_REFRESH_TOKEN,
//      TRAKT_HISTORY_LIMIT (optional, default 8).
// Netlify mirror: netlify/functions/trakt-recent.mts.

type TraktIds = { slug?: string; trakt?: number };

type TraktMovie = {
  title?: string;
  year?: number;
  ids?: TraktIds;
  images?: { poster?: string[] };
};

type TraktEpisode = {
  title?: string;
  season?: number;
  number?: number;
  ids?: TraktIds;
};

type TraktShow = {
  title?: string;
  year?: number;
  ids?: TraktIds;
  images?: { poster?: string[] };
};

type TraktHistoryEntry = {
  watched_at?: string;
  type?: string;
  movie?: TraktMovie;
  episode?: TraktEpisode;
  show?: TraktShow;
};

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

const TIMEOUT = 8_000;
const DEFAULT_LIMIT = 8;
const IMAGE_PATH = "/api/trakt/image";

// Warm-instance last-good response, used when Trakt rate-limits or errors.
let lastGood: { items: RecentItem[]; profileUrl?: string; updatedAt: string } | null = null;

function historyLimit(): number {
  const raw = Number(process.env.TRAKT_HISTORY_LIMIT);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_LIMIT;
  return Math.min(24, Math.floor(raw));
}

function absoluteImage(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `https://${path}`;
}

function proxiedPoster(path?: string): string | undefined {
  const absolute = absoluteImage(path);
  if (!absolute) return undefined;
  return `${IMAGE_PATH}?u=${encodeURIComponent(absolute)}`;
}

// Trakt access tokens live 7 days and refresh tokens are SINGLE-USE: every
// refresh returns a new refresh_token and immediately invalidates the old one.
// This deployment has no durable store, so the rotated token cannot be saved.
// Consequence: the integration runs ~7 days after `npm run trakt:auth`, then
// the stored refresh token is rejected and the owner must re-run it. That
// condition is detected and surfaced as `traktReauthRequired` instead of
// breaking the portfolio (the section simply hides / serves last-good).
type TokenResult = { token: string | null; reauth: boolean };

/** Mint an access token: stored one while fresh, otherwise refresh once. */
async function getAccessToken(): Promise<TokenResult> {
  const id = process.env.TRAKT_CLIENT_ID;
  const secret = process.env.TRAKT_CLIENT_SECRET;
  const stored = process.env.TRAKT_ACCESS_TOKEN;
  const expiresAt = Number(process.env.TRAKT_ACCESS_EXPIRES_AT || 0);
  if (stored && Date.now() < expiresAt - 60_000) return { token: stored, reauth: false };
  const refresh = process.env.TRAKT_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return { token: stored ?? null, reauth: false };
  try {
    const res = await fetch("https://api.trakt.tv/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "User-Agent": "portfolio-currently/1.0",
      },
      body: JSON.stringify({
        refresh_token: refresh,
        client_id: id,
        client_secret: secret,
        redirect_uri: process.env.TRAKT_REDIRECT_URI || "http://127.0.0.1:3000/trakt-callback",
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!res.ok) {
      // invalid_grant here means the single-use refresh token was already
      // consumed (or expired) — the only fix is re-authorizing once.
      const body = await res.text().catch(() => "");
      const reauth =
        res.status === 400 || res.status === 401 || res.status === 403 || body.includes("invalid_grant");
      if (reauth) console.warn("[trakt] stored refresh token rejected — re-run `npm run trakt:auth`");
      return { token: null, reauth };
    }
    const body = (await res.json()) as { access_token?: string };
    return { token: body.access_token ?? null, reauth: false };
  } catch {
    return { token: null, reauth: false };
  }
}

function buildProfileUrl(): string | undefined {
  const username = process.env.TRAKT_USERNAME;
  return username ? `https://trakt.tv/users/${encodeURIComponent(username)}` : undefined;
}

function normalize(entries: TraktHistoryEntry[]): RecentItem[] {
  const items: RecentItem[] = [];
  for (const entry of entries) {
    if (!entry.watched_at) continue;
    if (entry.type === "movie" && entry.movie?.title) {
      const slug = entry.movie.ids?.slug;
      items.push({
        type: "movie",
        title: entry.movie.title,
        year: entry.movie.year,
        watchedAt: entry.watched_at,
        poster: proxiedPoster(entry.movie.images?.poster?.[0]),
        traktUrl: slug ? `https://trakt.tv/movies/${slug}` : undefined,
      });
    } else if (entry.type === "episode" && entry.show?.title) {
      const showSlug = entry.show.ids?.slug;
      const ep = entry.episode ?? {};
      const hasNumbers = ep.season != null && ep.number != null;
      items.push({
        type: "episode",
        showTitle: entry.show.title,
        episodeTitle: ep.title,
        season: ep.season,
        episode: ep.number,
        watchedAt: entry.watched_at,
        poster: proxiedPoster(entry.show.images?.poster?.[0]),
        traktUrl:
          showSlug && hasNumbers
            ? `https://trakt.tv/shows/${showSlug}/seasons/${ep.season}/episodes/${ep.number}`
            : showSlug
              ? `https://trakt.tv/shows/${showSlug}`
              : undefined,
      });
    }
  }
  return items;
}

async function fetchHistory(
  limit: number
): Promise<{ items: RecentItem[]; ok: boolean; reauth: boolean }> {
  const { token, reauth } = await getAccessToken();
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) return { items: [], ok: false, reauth };
  try {
    const res = await fetch(
      `https://api.trakt.tv/users/me/history?limit=${limit}&extended=full`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": clientId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "User-Agent": "portfolio-currently/1.0",
        },
        signal: AbortSignal.timeout(TIMEOUT),
      }
    );
    if (!res.ok) return { items: [], ok: false, reauth };
    const entries = (await res.json()) as TraktHistoryEntry[];
    return { items: normalize(entries), ok: true, reauth };
  } catch {
    return { items: [], ok: false, reauth };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items, ok, reauth } = await fetchHistory(historyLimit());
  const profileUrl = buildProfileUrl();

  if (ok && items.length > 0) {
    lastGood = { items, profileUrl, updatedAt: new Date().toISOString() };
  }

  // Serve last-good on failure; otherwise an honest empty response the
  // frontend uses to hide the section.
  const payload =
    ok && items.length > 0
      ? { items, profileUrl, updatedAt: new Date().toISOString(), source: "live" }
      : lastGood
        ? { ...lastGood, source: "cached" }
        : { items: [], profileUrl, updatedAt: new Date().toISOString(), source: "empty" };

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
  return res.status(200).json({ ...payload, ...(reauth ? { traktReauthRequired: true } : {}) });
}
