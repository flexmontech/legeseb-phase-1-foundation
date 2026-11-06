import { useSyncExternalStore } from "react";
import { createSeedState, type AppState } from "./model";
import { normalizeState } from "./phase2";

const KEY = "legeseb:v2";
let state: AppState | null = null;
const listeners = new Set<() => void>();

function load(): AppState {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
     state = normalizeState(raw ? (JSON.parse(raw) as AppState) : createSeedState());
  } catch {
    state = createSeedState();
  }
  return state;
}

export function getState() {
  return load();
}

export function update(fn: (s: AppState) => AppState) {
  state = fn(load());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

export function resetDemo() {
  update(() => createSeedState());
}

const serverSnapshot = createSeedState("1970-01-01T00:00:00.000Z");

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    load,
    () => serverSnapshot,
  );
}

export function useActiveIndustry() {
  const s = useAppState();
  return s.industries.find((i) => i.id === s.activeIndustryId) ?? null;
}
