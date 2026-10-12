// CmdlineToast — the site's only toast, styled as a bottom-edge status line
// in the same mono/instrument idiom as the footer, never as a floating card.
// Portalled to document.body so it sits above all content, and announced
// through a polite live region.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ToastMessage = { text: string; tone: "info" | "error" } | null;

const VISIBLE_MS = 3200;

export function CmdlineToast({ message }: { message: ToastMessage }) {
  const [shown, setShown] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!message) return;
    setShown(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShown(false), VISIBLE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [message]);

  if (!message) return null;

  return createPortal(
    <div
      className={`cmdline${shown ? " is-shown" : ""}${message.tone === "error" ? " is-error" : ""}`}
      role="status"
      aria-live="polite"
      onClick={() => setShown(false)}
    >
      <span className="cmdline__prompt" aria-hidden="true">:</span>
      {message.text}
    </div>,
    document.body
  );
}
