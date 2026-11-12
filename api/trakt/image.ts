// GET /api/trakt/image?u=<encoded trakt cdn url> — cached artwork proxy.
//
// Trakt's guidelines require applications to cache images rather than
// hotlink its CDN from the browser, so posters are fetched once and served
// from this origin with long-lived cache headers.
//
// Only Trakt image hosts are permitted (SSRF guard). Netlify mirror:
// netlify/functions/trakt-image.mts.

const TIMEOUT = 8_000;
const ALLOWED_HOST = /(^|\.)trakt\.tv$/i;
const ALLOWED_IMAGE_PATH = /\.(webp|jpg|jpeg|png)$/i;

function isAllowedImage(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      ALLOWED_HOST.test(url.hostname) &&
      // Trakt migrated from walter-r2.trakt.tv/images/... to
      // media.trakt.tv/... (no "/images/" segment), so don't pin the
      // pathname shape — the host allowlist + image extension is the
      // SSRF boundary.
      ALLOWED_IMAGE_PATH.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const raw = typeof req.query?.u === "string" ? req.query.u : "";
  if (!raw || !isAllowedImage(raw)) {
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(400).end();
  }
  try {
    const upstream = await fetch(raw, {
      headers: { Accept: "image/*", "User-Agent": "portfolio-currently/1.0" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!upstream.ok) {
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.status(404).end();
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400, immutable"
    );
    return res.status(200).send(buffer);
  } catch {
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(502).end();
  }
}
