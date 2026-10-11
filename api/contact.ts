// POST /api/contact — hire-me form endpoint (Vercel).
//
// Env vars (server-side, never exposed to the browser):
//   RESEND_API_KEY    Resend API key (https://resend.com — free tier).
//                     With Resend's shared sender (onboarding@resend.dev)
//                     delivery only works to your own account address,
//                     which is the intended use here: messages come to you.
//   CONTACT_TO_EMAIL  Where messages land (same address the form displays).
//
// Without both keys the endpoint answers 503 and the form shows its
// fallback line instead of pretending success. Netlify deploys the same
// logic via netlify/functions/contact.mts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { from: 200, subject: 120, message: 4000 };
const RESEND_TIMEOUT_MS = 10_000;

/** Trim + cap untrusted input; never trust client lengths. */
function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseBody(req: any): Record<string, unknown> | null {
  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "method" });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    return res.status(503).json({ ok: false, code: "unconfigured" });
  }

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ ok: false, code: "bad_json" });
  }

  const from = clean(body.from, MAX.from);
  const subject = clean(body.subject, MAX.subject);
  const message = clean(body.message, MAX.message);
  if (!EMAIL_RE.test(from) || !subject || !message) {
    return res.status(400).json({ ok: false, code: "invalid" });
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
      return res.status(502).json({ ok: false, code: "provider" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[contact] resend failed", e);
    return res.status(502).json({ ok: false, code: "provider" });
  }
}
