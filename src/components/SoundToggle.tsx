import { useEffect, useState } from "react";
import { play, unlock } from "cuelume";
import { applySoundEnabled, getInitialSoundEnabled } from "../lib/sound";

// Speaker toggle — the visible control the sound palette needs. Sound is on by
// default; the first enable also unlocks the AudioContext inside the gesture,
// which browsers require before a page may make sound.

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" />
      <path className="sound-toggle__wave" d="M15 9.2a4 4 0 0 1 0 5.6" />
      <path className="sound-toggle__wave" d="M17.6 6.8a7.4 7.4 0 0 1 0 10.4" />
      <path className="sound-toggle__slash" d="M4 4l16 16" />
    </svg>
  );
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(getInitialSoundEnabled);

  useEffect(() => {
    applySoundEnabled(enabled);
  }, [enabled]);

  const onToggle = async () => {
    if (!enabled) {
      // Make the palette audible before playing the confirmation cue; unlock()
      // starts audio inside this click, where browsers allow it.
      applySoundEnabled(true);
      await unlock();
      setEnabled(true);
      play("tap", { emphasis: "subtle" });
      return;
    }
    play("close", { emphasis: "subtle" });
    window.setTimeout(() => setEnabled(false), 120);
  };

  return (
    <button
      type="button"
      className={`sound-toggle${enabled ? " is-on" : ""}`}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn interface sounds off" : "Turn interface sounds on"}
      title={enabled ? "Turn interface sounds off" : "Turn interface sounds on"}
      onClick={onToggle}
    >
      <SpeakerIcon />
    </button>
  );
}
