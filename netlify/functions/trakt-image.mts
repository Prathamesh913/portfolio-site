// Netlify mirror of api/trakt/image.ts — cached artwork proxy.
// Only Trakt image hosts are permitted (SSRF guard).

const TIMEOUT = 8_000;
const ALLOWED_HOST = /(^|\.)trakt\.tv$/i;

function isAllowedImage(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      ALLOWED_HOST.test(url.hostname) &&
      url.pathname.includes("/images/")
    );
  } catch {
    return false;
  }
}

export const handler = async (event: { queryStringParameters?: Record<string, string> }) => {
  const raw = event.queryStringParameters?.u ?? "";
  if (!raw || !isAllowedImage(raw)) {
    return { statusCode: 400, headers: { "Cache-Control": "public, max-age=300" }, body: "" };
  }
  try {
    const upstream = await fetch(raw, {
      headers: { Accept: "image/*", "User-Agent": "portfolio-currently/1.0" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    if (!upstream.ok) {
      return { statusCode: 404, headers: { "Cache-Control": "public, max-age=300" }, body: "" };
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400, immutable",
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch {
    return { statusCode: 502, headers: { "Cache-Control": "public, max-age=300" }, body: "" };
  }
};
