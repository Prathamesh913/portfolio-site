// Netlify mirror of api/contact.ts — same validation, same response shape.
// Deploy target picks one: Vercel runs api/, Netlify runs this file.
// Env vars: RESEND_API_KEY, CONTACT_TO_EMAIL.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { from: 200, subject: 120, message: 4000 };
const RESEND_TIMEOUT_MS = 10_000;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseBody(event: any): Record<string, unknown> | null {
  try {
    const raw = event?.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body
      : null;
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const handler = async (event: any) => {
  const json = (statusCode: number, payload: Record<string, unknown>) => ({
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (event?.httpMethod && event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { allow: "POST" }, body: "" };
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    return json(503, { ok: false, code: "unconfigured" });
  }

  const body = parseBody(event);
  if (!body) {
    return json(400, { ok: false, code: "bad_json" });
  }

  const from = clean(body.from, MAX.from);
  const subject = clean(body.subject, MAX.subject);
  const message = clean(body.message, MAX.message);
  if (!EMAIL_RE.test(from) || !subject || !message) {
    return json(400, { ok: false, code: "invalid" });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: from,
        subject: `[portfolio] ${subject}`,
        text: `${message}\n\n— ${from}`,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
    if (!r.ok) {
      console.error("[contact] resend rejected", r.status);
      return json(502, { ok: false, code: "provider" });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error("[contact] resend failed", e);
    return json(502, { ok: false, code: "provider" });
  }
};
