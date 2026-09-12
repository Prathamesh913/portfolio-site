// GET /api/currently — Vercel serverless aggregator for the Currently section.
//
// Env vars (all server-side, never exposed to the browser):
//   TRAKT_CLIENT_ID, TRAKT_USERNAME            (public profile history; OAuth optional)
//   TRAKT_CLIENT_SECRET, TRAKT_ACCESS_TOKEN, TRAKT_ACCESS_EXPIRES_AT,
//     TRAKT_REFRESH_TOKEN                      (OAuth via `npm run trakt:auth`;
//                                              reads /users/me regardless of privacy)
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//   HARDCOVER_API_TOKEN
//
// Any provider without credentials is skipped and reported as "snapshot",
// so the frontend falls back to its curated data per-card. Deploy the same
// logic to Netlify via netlify/functions/currently.mts.

type Watching = {
  kind: "movie" | "show";
  title: string;
  detail?: string;
  year?: number;
  watchedAt?: string;
  url?: string;
  isNow?: boolean;
} | null;

type Listening = {
  track: string;
  artist: string;
  album?: string;
  albumArt?: string;
  url?: string;
  isPlaying?: boolean;
  playedAt?: string;
} | null;

type Reading = {
  title: string;
  author?: string;
  progressPercent?: number;
  url?: string;
} | null;

const TIMEOUT = 8_000;
const withTimeout = () => AbortSignal.timeout(TIMEOUT);

// ---- Trakt: active scrobble first, then most recent history item ----
// Operational telemetry for the Watching card (no secrets — stage names and
// HTTP statuses only). Lets /api/currently itself say why Trakt failed.
type TraktDebug = { stage: string; status: number | string; authed: boolean; reauth: boolean };

// ---- Trakt auth: stored user access token first, opportunistic refresh,
// anonymous client_id key last. Authenticated calls read /users/me, so they
// see history regardless of profile-privacy toggles. Never throws.
async function getTraktAccess(): Promise<{
  token: string | null;
  stage: string;
  status: number | string;
  reauth: boolean;
}> {
  const id = process.env.TRAKT_CLIENT_ID;
  const secret = process.env.TRAKT_CLIENT_SECRET;
  const storedAccess = process.env.TRAKT_ACCESS_TOKEN;
  const accessExp = Number(process.env.TRAKT_ACCESS_EXPIRES_AT || 0);
  if (storedAccess && Date.now() < accessExp - 60_000) {
    return { token: storedAccess, stage: "stored-access", status: "fresh", reauth: false };
  }
  const storedRefresh = process.env.TRAKT_REFRESH_TOKEN;
  if (!id || !secret || !storedRefresh) {
    return { token: null, stage: "unconfigured", status: "missing-vars", reauth: false };
  }
  try {
    const res = await fetch("https://api.trakt.tv/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "User-Agent": "portfolio-currently/1.0",
      },
      body: JSON.stringify({
        refresh_token: storedRefresh,
        client_id: id,
        client_secret: secret,
        redirect_uri: "http://127.0.0.1:3000/trakt-callback",
        grant_type: "refresh_token",
      }),
      signal: withTimeout(),
    });
    if (!res.ok) {
      // invalid_grant => the single-use refresh token was already consumed.
      const text = await res.text().catch(() => "");
      const reauth =
        res.status === 400 || res.status === 401 || res.status === 403 || text.includes("invalid_grant");
      if (reauth) console.warn("[trakt] stored refresh token rejected — re-run `npm run trakt:auth`");
      return { token: null, stage: "refresh", status: res.status, reauth };
    }
    const body = (await res.json()) as { access_token?: string };
    return body.access_token
      ? { token: body.access_token, stage: "refresh", status: res.status, reauth: false }
      : { token: null, stage: "refresh", status: "no-token-in-response", reauth: false };
  } catch {
    return { token: null, stage: "refresh", status: "network-error", reauth: false };
  }
}

async function getWatching(): Promise<{ data: Watching; live: boolean; debug: TraktDebug }> {
  const clientId = process.env.TRAKT_CLIENT_ID;
  const username = process.env.TRAKT_USERNAME;
  const auth = await getTraktAccess();
  const debug: TraktDebug = {
    stage: auth.stage,
    status: auth.status,
    authed: !!auth.token,
    reauth: auth.reauth,
  };
  const accessToken = auth.token;
  const userPath = accessToken ? "me" : username ? encodeURIComponent(username) : null;
  if (!userPath || (!accessToken && !clientId)) return { data: null, live: false, debug };
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    // Trakt sits behind bot protection that challenges default server fetch
    // user-agents — identify or calls get 403'd with an HTML block page.
    "User-Agent": "portfolio-currently/1.0",
    // Trakt requires BOTH the api-key and the Bearer token on authenticated
    // calls — Bearer alone is answered with a 403 HTML challenge page.
    "trakt-api-key": clientId,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  try {
    const watchingRes = await fetch(
      `https://api.trakt.tv/users/${userPath}/watching`,
      { headers, signal: withTimeout() }
    );
    debug.stage = accessToken ? "authed-watching" : "anon-watching";
    debug.status = watchingRes.status;
    // 204 No Content means "nothing scrobbling" — there is no body to parse.
    if (watchingRes.ok && watchingRes.status !== 204) {
      const w = (await watchingRes.json()) as Record<string, any>;
      if (w && (w.show || w.movie)) {
        if (w.show) {
          const ep = w.episode ?? {};
          const num =
            ep.season != null && ep.number != null
              ? `S${String(ep.season).padStart(2, "0")} E${String(ep.number).padStart(2, "0")}`
              : undefined;
          return {
            data: {
              kind: "show",
              title: w.show.title,
              detail: [num, ep.title].filter(Boolean).join(" · ") || undefined,
              year: w.show.year,
              url: w.show.ids?.slug ? `https://trakt.tv/shows/${w.show.ids.slug}` : undefined,
              isNow: true,
            },
            live: true,
            debug,
          };
        }
        return {
          data: {
            kind: "movie",
            title: w.movie.title,
            year: w.movie.year,
            url: w.movie.ids?.slug ? `https://trakt.tv/movies/${w.movie.ids.slug}` : undefined,
            isNow: true,
          },
          live: true,
          debug,
        };
      }
    }
    const histRes = await fetch(
      `https://api.trakt.tv/users/${userPath}/history?limit=1&extended=full`,
      { headers, signal: withTimeout() }
    );
    debug.stage = accessToken ? "authed-history" : "anon-history";
    debug.status = histRes.status;
    if (!histRes.ok) return { data: null, live: false, debug };
    const [item] = (await histRes.json()) as Array<Record<string, any>>;
    if (!item) return { data: null, live: false, debug };
    if (item.type === "movie" && item.movie) {
      return {
        data: {
          kind: "movie",
          title: item.movie.title,
          year: item.movie.year,
          watchedAt: item.watched_at,
          url: item.movie.ids?.slug ? `https://trakt.tv/movies/${item.movie.ids.slug}` : undefined,
        },
        live: true,
        debug,
      };
    }
    if (item.show) {
      const ep = item.episode ?? {};
      const num =
        ep.season != null && ep.number != null
          ? `S${String(ep.season).padStart(2, "0")} E${String(ep.number).padStart(2, "0")}`
          : undefined;
      return {
        data: {
          kind: "show",
          title: item.show.title,
          detail: [num, ep.title].filter(Boolean).join(" · ") || undefined,
          year: item.show.year,
          watchedAt: item.watched_at,
          url: item.show.ids?.slug ? `https://trakt.tv/shows/${item.show.ids.slug}` : undefined,
        },
        live: true,
        debug,
      };
    }
    return { data: null, live: false, debug };
  } catch {
    debug.stage = "network-error";
    return { data: null, live: false, debug };
  }
}

// ---- Spotify: refresh-token flow, currently-playing then last played ----
// Note: since mid-2026 Spotify refresh tokens expire 6 months after the user
// authorizes. A `reauth_required` error means: re-run the auth step in the
// setup notes to mint a fresh refresh token.
async function getListening(): Promise<{ data: Listening; live: boolean; reauth?: boolean }> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return { data: null, live: false };
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
      signal: withTimeout(),
    });
    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => "");
      return { data: null, live: false, reauth: body.includes("invalid_grant") };
    }
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return { data: null, live: false };
    const auth = { Authorization: `Bearer ${access_token}` };

    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: auth,
      signal: withTimeout(),
    });
    if (nowRes.ok && nowRes.status !== 204) {
      const now = (await nowRes.json()) as Record<string, any>;
      const item = now?.item;
      if (item) {
        return {
          data: {
            track: item.name,
            artist: (item.artists ?? []).map((a: any) => a.name).join(", "),
            album: item.album?.name,
            albumArt: item.album?.images?.[0]?.url,
            url: item.external_urls?.spotify,
            isPlaying: now.is_playing ?? true,
          },
          live: true,
        };
      }
    }
    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: auth,
      signal: withTimeout(),
    });
    if (!recentRes.ok) return { data: null, live: false };
    const [entry] = (((await recentRes.json()) as Record<string, any>).items ?? []) as Array<Record<string, any>>;
    const track = entry?.track;
    if (!track) return { data: null, live: false };
    return {
      data: {
        track: track.name,
        artist: (track.artists ?? []).map((a: any) => a.name).join(", "),
        album: track.album?.name,
        albumArt: track.album?.images?.[0]?.url,
        url: track.external_urls?.spotify,
        isPlaying: false,
        playedAt: entry.played_at,
      },
      live: true,
    };
  } catch {
    return { data: null, live: false };
  }
}

// ---- Hardcover: currently-reading shelf (status_id 2) via GraphQL ----
async function getReading(): Promise<{ data: Reading; live: boolean }> {
  const token = process.env.HARDCOVER_API_TOKEN;
  if (!token) return { data: null, live: false };
  try {
    const gqlRes = await fetch("https://api.hardcover.app/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `query CurrentlyReading {
          me {
            user_books(where: {status_id: {_eq: 2}}, order_by: {updated_at: desc}, limit: 1) {
              progress_pages
              book { title slug pages contributions { author { name } } }
              user_book_reads(order_by: {id: desc}, limit: 1) { progress progress_pages }
            }
          }
        }`,
      }),
      signal: withTimeout(),
    });
    if (!gqlRes.ok) return { data: null, live: false };
    const json = (await gqlRes.json()) as Record<string, any>;
    const ub = json?.data?.me?.[0]?.user_books?.[0] ?? json?.data?.me?.user_books?.[0];
    if (!ub?.book) return { data: null, live: false };
    const read = ub.user_book_reads?.[0];
    let progress: number | undefined;
    if (typeof read?.progress === "number") progress = Math.round(read.progress * 100);
    else if (typeof read?.progress_pages === "number" && ub.book.pages)
      progress = Math.round((read.progress_pages / ub.book.pages) * 100);
    else if (typeof ub.progress_pages === "number" && ub.book.pages)
      progress = Math.round((ub.progress_pages / ub.book.pages) * 100);
    return {
      data: {
        title: ub.book.title,
        author: ub.book.contributions?.[0]?.author?.name,
        progressPercent: progress,
        url: ub.book.slug ? `https://hardcover.app/books/${ub.book.slug}` : undefined,
      },
      live: true,
    };
  } catch {
    return { data: null, live: false };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const [watching, listening, reading] = await Promise.all([
    getWatching(),
    getListening(),
    getReading(),
  ]);
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  // Trakt refresh tokens are single-use and rotate; with no durable store the
  // rotated token is lost, so after ~7 days the stored one is rejected. Flag it
  // so the owner knows to re-run `npm run trakt:auth`, instead of silently
  // falling back forever.
  const traktReauth = watching.debug.reauth;
  return res.status(200).json({
    watching: watching.data,
    listening: listening.data,
    reading: reading.data,
    updatedAt: new Date().toISOString().slice(0, 10),
    sources: {
      trakt: watching.live ? "live" : "snapshot",
      spotify: listening.live ? "live" : "snapshot",
      hardcover: reading.live ? "live" : "snapshot",
    },
    ...(listening.reauth ? { spotifyReauthRequired: true } : {}),
    ...(traktReauth ? { traktReauthRequired: true } : {}),
    traktDebug: watching.debug,
  });
}
