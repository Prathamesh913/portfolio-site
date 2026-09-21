// Spotify Embed (IFrame API) helper for the Currently → Listening turntable.
//
// Clicking the tonearm plays the current track inside a hidden embed — no
// owner OAuth grant, no Premium-on-owner, no SDK scopes to babysit. Anything
// that fails logs and the card keeps its illustration-only behaviour.

export type SpotifyEmbedController = {
  play: () => unknown;
  pause: () => unknown;
  loadUri: (uri: string) => void;
  addListener: (event: string, cb: (e: any) => void) => void;
};

type SpotifyIframeApi = {
  createController: (
    el: HTMLElement,
    opts: Record<string, unknown>,
    cb: (c: SpotifyEmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let apiPromise: Promise<SpotifyIframeApi | null> | null = null;

export function loadSpotifyEmbed(): Promise<SpotifyIframeApi | null> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      let settled = false;
      const done = (v: SpotifyIframeApi | null) => {
        if (!settled) {
          settled = true;
          resolve(v);
        }
      };
      window.onSpotifyIframeApiReady = (api) => done(api);
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => done(null);
      document.head.appendChild(script);
      setTimeout(() => done(null), 9000);
    });
  }
  return apiPromise;
}

/** open.spotify.com/track/<id> → spotify:track:<id> (episodes likewise). */
export function spotifyUriFromUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/(track|episode)\/([A-Za-z0-9]+)/);
  return match ? `spotify:${match[1]}:${match[2]}` : null;
}
