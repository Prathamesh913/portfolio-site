// HireForm — contact as a terminal-style composer.
//
// The form is written in the site's own language: a command prompt, header
// rows split by the same dividers as the experience list, a quiet bordered
// send. No boxes, no shadows — mono type and hairlines only.
//
// Delivery goes through the same dual-endpoint pattern as the Currently
// section (Vercel /api/contact, then the Netlify function mirror). The
// destination address is intentionally visible in the `to:` row — a form
// that hides where it sends is a form that looks broken.

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "prathameshjadhav913@gmail.com";
const ENDPOINTS = ["/api/contact", "/.netlify/functions/contact"];
const TIMEOUT_MS = 10_000;

type SendState = "idle" | "sending" | "sent" | "error" | "unconfigured";

const STATUS_TEXT: Record<SendState, string> = {
  idle: "",
  sending: "sending…",
  sent: "sent.",
  error: "couldn't send — the address above still works.",
  unconfigured: "form isn't connected — the address above still works.",
};

export function HireForm() {
  const [state, setState] = useState<SendState>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    const payload = JSON.stringify({
      from: String(data.get("from") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
      // Honeypot: bots fill every field. Humans never see this one, so a
      // non-empty value means the submission is discarded server-side.
      trap: String(data.get("trap") ?? ""),
    });

    let unconfigured = false;
    for (const url of ENDPOINTS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: payload,
          signal: controller.signal,
        });
        if (res.ok) {
          setState("sent");
          form.reset();
          return;
        }
        // 503 = this endpoint exists but has no mail key; the mirror would
        // answer the same, so stop instead of doubling the wait.
        if (res.status === 503) {
          unconfigured = true;
          break;
        }
      } catch {
        // Network/timeout on this endpoint — try the next one.
      } finally {
        clearTimeout(timer);
      }
    }
    setState(unconfigured ? "unconfigured" : "error");
  };

  return (
    <section className="hire" aria-label="Contact">
      <p className="hire__prompt" aria-hidden="true">
        <span className="hire__dollar">$</span> cat hire.me
      </p>
      <form className="hire__form" onSubmit={onSubmit} noValidate={false}>
        <div className="hire__row">
          <span className="hire__label" id="hire-to">to:</span>
          <span className="hire__value" aria-labelledby="hire-to">{CONTACT_EMAIL}</span>
        </div>
        <div className="hire__row">
          <label className="hire__label" htmlFor="hire-from">from:</label>
          <input
            className="hire__input"
            id="hire-from"
            name="from"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="hire__row">
          <label className="hire__label" htmlFor="hire-subject">subject:</label>
          <input
            className="hire__input"
            id="hire-subject"
            name="subject"
            type="text"
            required
            maxLength={120}
            placeholder="What's this about?"
          />
        </div>
        <div className="hire__body">
          <label className="sr-only" htmlFor="hire-message">message</label>
          <textarea
            className="hire__textarea"
            id="hire-message"
            name="message"
            required
            rows={4}
            maxLength={4000}
            placeholder="We found your profile and have an opportunity that matches your stack…"
          />
        </div>
        <div className="hire__foot">
          <p className="hire__status" role="status" aria-live="polite">{STATUS_TEXT[state]}</p>
          <button className="hire__send" type="submit" disabled={state === "sending"}>
            send
          </button>
        </div>
        <input className="hire__trap" type="text" name="trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </form>
    </section>
  );
}
