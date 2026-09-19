// Currently — live media snapshot (watching / listening / reading).
//
// The UI renders `currentlyFallback` until `/api/currently` answers.
// That endpoint (api/currently.ts on Vercel, netlify/functions/currently.mts
// on Netlify) holds every secret server-side and returns this same shape,
// so swapping curated data for live data needs no component changes.
//
// To curate by hand, just edit `currentlyFallback` below.

export type CurrentlyWatching = {
  kind: "movie" | "show";
  title: string;
  /** e.g. "S02 E04 · The Long Night" for episodes, undefined for movies. */
  detail?: string;
  year?: number;
  watchedAt?: string;
  /** Deep link, e.g. https://trakt.tv/movies/dune-part-two-2024 */
  url?: string;
  /** Proxied Trakt poster path (via /api/trakt/image) when artwork is available. */
  poster?: string;
  /** True when Trakt reports an active scrobble rather than history. */
  isNow?: boolean;
};

export type CurrentlyListening = {
  track: string;
  artist: string;
  album?: string;
  albumArt?: string;
  url?: string;
  isPlaying?: boolean;
  playedAt?: string;
};

export type CurrentlyReading = {
  title: string;
  author?: string;
  /** 0–100 */
  progressPercent?: number;
  url?: string;
  startedAt?: string;
  /** Source-confirmed cover artwork (Hardcover edition image when live). */
  cover?: string;
};

export type CurrentlySource = "live" | "snapshot";

export type CurrentlySnapshot = {
  watching: CurrentlyWatching | null;
  listening: CurrentlyListening | null;
  reading: CurrentlyReading | null;
  updatedAt: string;
  sources: Record<"trakt" | "spotify" | "hardcover", CurrentlySource>;
};

export const currentlyFallback: CurrentlySnapshot = {
  watching: {
    kind: "show",
    title: "Severance",
    detail: "S02 E07 · Chikhai Bardo",
    year: 2025,
    url: "https://trakt.tv/shows/severance",
  },
  listening: {
    track: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    url: "https://open.spotify.com/search/M83%20Midnight%20City",
    isPlaying: false,
  },
  reading: {
    title: "The Design of Everyday Things",
    author: "Don Norman",
    progressPercent: 42,
    url: "https://hardcover.app/search?query=The%20Design%20of%20Everyday%20Things",
  },
  updatedAt: "2026-09-03",
  sources: { trakt: "snapshot", spotify: "snapshot", hardcover: "snapshot" },
};
