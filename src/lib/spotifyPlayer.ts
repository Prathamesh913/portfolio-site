// Spotify Web Playback SDK helper for the Currently → Listening turntable.
//
// The tonearm click creates a hidden browser player on the owner's account
// (via a short-lived token from /api/spotify/token) and really starts the
// current track. Anything that fails — no Premium, blocked SDK, expired grant —
// resolves to false/null and the card keeps its illustration-only behaviour.

type SpotifyWindow = {
  Spotify?: { Player: new (options: Record<string, unknown>) => SpotifyPlayer };
  onSpotifyWebPlaybackSDKReady?: () => void;
};

export type SpotifyPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
  addListener: (event: string, callback: (state: any) => void) => void;
};

const TOKEN_ENDPOINTS = ["/api/spotify/token", "/.netlify/functions/spotify-token"];

let sdkPromise: Promise<boolean> | null = null;

export function loadSpotifySDK(): Promise<boolean> {
  const w = window as unknown as SpotifyWindow;
  if (w.Spotify?.Player) return Promise.resolve(true);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve) => {
      let settled = false;
      const done = (value: boolean) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };
      w.onSpotifyWebPlaybackSDKReady = () => done(true);
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onerror = () => done(false);
      document.head.appendChild(script);
      setTimeout(() => done(Boolean((window as unknown as SpotifyWindow).Spotify?.Player)), 9000);
    });
  }
  return sdkPromise;
}

export async function fetchPlayerToken(): Promise<string | null> {
  for (const url of TOKEN_ENDPOINTS) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) continue;
      const json = (await res.json()) as { access_token?: unknown };
      if (typeof json.access_token === "string" && json.access_token) return json.access_token;
    } catch {
      // Try the next endpoint.
    }
  }
  return null;
}

/** open.spotify.com/track/<id> → spotify:track:<id> (episodes likewise). */
export function spotifyUriFromUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/(track|episode)\/([A-Za-z0-9]+)/);
  return match ? `spotify:${match[1]}:${match[2]}` : null;
}

async function api(token: string, path: string, options?: RequestInit): Promise<boolean> {
  try {
    const res = await fetch(`https://api.spotify.com/v1${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    // 204 No Content is success for player endpoints.
    return res.ok;
  } catch {
    return false;
  }
}

/** Claim the browser device without autoplay, so play starts from this card. */
export async function transferToDevice(token: string, deviceId: string): Promise<boolean> {
  return api(token, "/me/player", {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

/** Start one track on the browser device. False = Premium/grant/scopes missing. */
export async function startTrack(
  token: string,
  deviceId: string,
  uri: string | null
): Promise<boolean> {
  if (!uri) return false;
  return api(token, `/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: "PUT",
    body: JSON.stringify({ uris: [uri] }),
  });
}

/** Pause on the browser device. */
export async function pauseTrack(token: string, deviceId: string): Promise<boolean> {
  return api(token, `/me/player/pause?device_id=${encodeURIComponent(deviceId)}`, {
    method: "PUT",
  });
}

/** Resume on the browser device. */
export async function resumeTrack(token: string, deviceId: string): Promise<boolean> {
  return api(token, `/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: "PUT",
  });
}
