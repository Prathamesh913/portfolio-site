// Sound preferences — the app owns the toggle, label and persistence; cuelume
// only plays. Stored under its own key so it survives reloads and stays
// independent of the theme preference.

import { setEnabled } from "cuelume";

export const SOUND_KEY = "portfolio-sound";

export function getInitialSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function applySoundEnabled(enabled: boolean): void {
  setEnabled(enabled);
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // Private mode / storage blocked — the in-memory toggle still works.
  }
}
