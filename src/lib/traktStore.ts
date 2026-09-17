// Shared Trakt media store.
//
// The page has exactly ONE source of truth for Trakt watch data: this module
// fetches `/api/trakt/recent` once (deduped across components) and both
// `RecentlyWatched` and the Currently → Watching card read from it. No second
// request, no duplicate Trakt logic, no independently-derived artwork.

import { useSyncExternalStore } from "react";
import { fetchRecentWatched, type RecentItem, type RecentSnapshot } from "./trakt";

export type TraktState = {
  snapshot: RecentSnapshot | null;
  loading: boolean;
};

let state: TraktState = { snapshot: null, loading: true };
const listeners = new Set<() => void>();
let started = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function start(): void {
  if (started) return;
  started = true;
  void fetchRecentWatched()
    .then((snapshot) => {
      state = { snapshot, loading: false };
      emit();
    })
    .catch(() => {
      state = { snapshot: null, loading: false };
      emit();
    });
}

function subscribe(listener: () => void): () => void {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TraktState {
  return state;
}

/** Subscribe to the shared recent-watch snapshot. */
export function useRecentWatched(): TraktState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Canonical display title for a normalized Trakt item. */
export function recentTitle(item: RecentItem): string {
  return item.type === "movie" ? item.title : item.showTitle;
}

const normalize = (value: string): string => value.trim().toLowerCase();

/**
 * Pick the poster for the Currently → Watching card from the shared source.
 *
 * When the currently-watching title matches the latest Recently Watched item,
 * reuse that item's artwork (the exact same asset). If they are different
 * media, keep whatever artwork the currently-watching item supplied. This is
 * the only place artwork is resolved for the currently watched item.
 */
export function pickWatchPoster(
  latest: RecentItem | null,
  watchingTitle: string | undefined,
  ownPoster: string | undefined
): string | undefined {
  if (latest && watchingTitle && normalize(recentTitle(latest)) === normalize(watchingTitle)) {
    return latest.poster ?? ownPoster;
  }
  return ownPoster;
}
