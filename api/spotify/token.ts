// GET /api/spotify/token — short-lived access token for the Web Playback SDK
// in the Currently → Listening card, minted from the stored refresh token.
//
// The token carries playback scopes (streaming, user-modify-playback-state),
// so it can start/pause playback on the owner's account — never cache it
// (no-store) and never log it. Deploy the same logic to Netlify via
// netlify/functions/spotify-token.mts.

const TIMEOUT = 8_000;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return res.status(404).json({ error: "Spotify not configured" });
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!tokenRes.ok) return res.status(502).json({ error: "token refresh failed" });
    const { access_token, expires_in } = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!access_token) return res.status(502).json({ error: "token refresh failed" });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ access_token, expires_in });
  } catch {
    return res.status(502).json({ error: "token refresh failed" });
  }
}
