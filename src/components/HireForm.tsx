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

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CmdlineToast, type ToastMessage } from "./CmdlineToast";

const CONTACT_EMAIL = "prathameshjadhav913@gmail.com";
const ENDPOINTS = ["/api/contact", "/.netlify/functions/contact"];
const TIMEOUT_MS = 10_000;

type SendState = "idle" | "sending" | "sent" | "error" | "unconfigured";

const STATUS_TEXT: Record<SendState, string> = {
  idle: "",
  sending: "sending…",
  sent: "",
  error: "couldn't send — the address above still works.",
  unconfigured: "form isn't connected — the address above still works.",
};

export function HireForm() {
  const [state, setState] = useState<SendState>("idle");
  // The success receipt replaces the composer entirely; focus moves to it so
  // the outcome is announced and the keyboard lands somewhere sensible. On
  // any failure the composer stays exactly as typed — a draft must never be
  // lost to a network error.
  const [receipt, setReceipt] = useState<{ subject: string } | null>(null);
  const [toast, setToast] = useState<ToastMessage>(null);
  const receiptRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (receipt) receiptRef.current?.focus();
  }, [receipt]);

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
          // Receipt replaces the composer; the strip flashes the same event
          // for anyone whose eyes have left the form.
          const subject = String(data.get("subject") ?? "").trim();
          form.reset();
          setState("sent");
          setReceipt({ subject });
          setToast({ text: "message sent", tone: "info" });
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
    setToast({
      text: unconfigured ? "form isn't connected — email above works" : "couldn't send — try again",
      tone: "error",
    });
  };

  return (
    <section className="hire" aria-label="Contact">
      {receipt ? (
        /* Success: the composer is replaced by its own delivery receipt —
           the mechanism reports its outcome, no overlay needed. */
        <div className="hire__receipt" role="status" aria-live="polite">
          <p className="hire__receipt-line" ref={receiptRef} tabIndex={-1}>
            <span className="hire__receipt-prompt" aria-hidden="true">&gt;</span>{" "}
            message delivered to {CONTACT_EMAIL}
          </p>
          {receipt.subject && <p className="hire__receipt-subject">“{receipt.subject}”</p>}
          <button
            className="hire__again"
            type="button"
            onClick={() => {
              setReceipt(null);
              setState("idle");
            }}
          >
            write another
          </button>
        </div>
      ) : (
        <>
          <p className="hire__intro">Email me — what's on your mind?</p>
          <form className="hire__form" onSubmit={onSubmit}>
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
      </>
      )}

      <CmdlineToast message={toast} />
    </section>
  );
}
