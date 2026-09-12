// Netlify mirror of api/currently.ts — same providers, same response shape.
// Deploy target picks one: Vercel runs api/, Netlify runs this file.
// Env vars: TRAKT_CLIENT_ID, TRAKT_USERNAME, SPOTIFY_CLIENT_ID,
// SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, HARDCOVER_API_TOKEN.

type Watching =
  | {
      kind: "movie" | "show";
      title: string;
      detail?: string;
      year?: number;
      watchedAt?: string;
      url?: string;
      isNow?: boolean;
    }
  | null;

type Listening =
  | {
      track: string;
      artist: string;
      album?: string;
      albumArt?: string;
      url?: string;
      isPlaying?: boolean;
      playedAt?: string;
    }
  | null;

type Reading =
  | { title: string; author?: string; progressPercent?: number; url?: string }
  | null;

const TIMEOUT = 8_000;
const withTimeout = () => AbortSignal.timeout(TIMEOUT);

// Operational telemetry for the Watching card (no secrets — stage names and
// HTTP statuses only). Lets the endpoint itself say why Trakt failed.
type TraktDebug = { stage: string; status: number | string; authed: boolean };

// ---- Trakt auth: stored user access token first, opportunistic refresh,
// anonymous client_id key last. Authenticated calls read /users/me, so they
// see history regardless of profile-privacy toggles. Never throws.
async function getTraktAccess(): Promise<{
  token: string | null;
  stage: string;
  status: number | string;
}> {
  const id = process.env.TRAKT_CLIENT_ID;
  const secret = process.env.TRAKT_CLIENT_SECRET;
  const storedAccess = process.env.TRAKT_ACCESS_TOKEN;
  const accessExp = Number(process.env.TRAKT_ACCESS_EXPIRES_AT || 0);
  if (storedAccess && Date.now() < accessExp - 60_000) {
    return { token: storedAccess, stage: "stored-access", status: "fresh" };
  }
  const storedRefresh = process.env.TRAKT_REFRESH_TOKEN;
  if (!id || !secret || !storedRefresh) {
    return { token: null, stage: "unconfigured", status: "missing-vars" };
  }
  try {
    const res = await fetch("https://api.trakt.tv/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: storedRefresh,
        client_id: id,
        client_secret: secret,
        redirect_uri: "http://127.0.0.1:3000/trakt-callback",
        grant_type: "refresh_token",
      }),
      signal: withTimeout(),
    });
    if (!res.ok) return { token: null, stage: "refresh", status: res.status };
    const body = (await res.json()) as { access_token?: string };
    return body.access_token
      ? { token: body.access_token, stage: "refresh", status: res.status }
      : { token: null, stage: "refresh", status: "no-token-in-response" };
  } catch {
    return { token: null, stage: "refresh", status: "network-error" };
  }
}

async function getWatching(): Promise<{ data: Watching; live: boolean; debug: TraktDebug }> {
  const clientId = process.env.TRAKT_CLIENT_ID;
  const username = process.env.TRAKT_USERNAME;
  const auth = await getTraktAccess();
  const debug: TraktDebug = { stage: auth.stage, status: auth.status, authed: !!auth.token };
  const accessToken = auth.token;
  const userPath = accessToken ? "me" : username ? encodeURIComponent(username) : null;
  if (!userPath || (!accessToken && !clientId)) return { data: null, live: false, debug };
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    // Trakt sits behind bot protection that challenges default server fetch
    // user-agents — identify or calls get 403'd with an HTML block page.
    "User-Agent": "portfolio-currently/1.0",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : { "trakt-api-key": clientId }),
  };
  try {
    const watchingRes = await fetch(
      `https://api.trakt.tv/users/${userPath}/watching`,
      { headers, signal: withTimeout() }
    );
    debug.stage = accessToken ? "authed-watching" : "anon-watching";
    debug.status = watchingRes.status;
    if (watchingRes.ok) {
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
    const [entry] = (((await recentRes.json()) as Record<string, any>).items ?? []) as Array<
      Record<string, any>
    >;
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

export const handler = async () => {
  const [watching, listening, reading] = await Promise.all([
    getWatching(),
    getListening(),
    getReading(),
  ]);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
    body: JSON.stringify({
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
      traktDebug: watching.debug,
    }),
  };
};
