// Netlify mirror of api/spotify/token.ts — same token, same shape.
// Short-lived access token for the Web Playback SDK; never cache, never log.

const TIMEOUT = 8_000;

export const handler = async () => {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  const json = (statusCode: number, body: unknown) => ({
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(body),
  });
  if (!id || !secret || !refresh) return json(404, { error: "Spotify not configured" });
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!tokenRes.ok) return json(502, { error: "token refresh failed" });
    const { access_token, expires_in } = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!access_token) return json(502, { error: "token refresh failed" });
    return json(200, { access_token, expires_in });
  } catch {
    return json(502, { error: "token refresh failed" });
  }
};
