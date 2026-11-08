import { useSyncExternalStore } from "react";
import { createSeedState, type AppState } from "./model";
import { normalizeState } from "./phase2";

// Two modes: "demo" = Chicago pilot kept in this browser only;
// "cloud" = a signed-in workspace saved to the backend (isolated per workspace).
const KEY = "legeseb:v2";
type Mode = { kind: "demo" } | { kind: "cloud"; workspaceId: string; name: string };
let mode: Mode = { kind: "demo" };
let state: AppState | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saver: ((s: AppState) => Promise<void>) | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

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

export function getMode() {
  return mode;
}

export function update(fn: (s: AppState) => AppState) {
  state = fn(load());
  if (mode.kind === "demo") {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
  } else if (saver) {
    const snapshot = state;
    const save = saver;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { void save(snapshot); }, 400);
  }
  emit();
}

/** Switch the app to a backend workspace. */
export function useCloudWorkspace(workspaceId: string, name: string, data: AppState, save: (s: AppState) => Promise<void>) {
  mode = { kind: "cloud", workspaceId, name };
  saver = save;
  state = normalizeState(data);
  emit();
}

/** Return to the browser-only Chicago demo. */
export function useDemoWorkspace() {
  if (saveTimer) clearTimeout(saveTimer);
  mode = { kind: "demo" };
  saver = null;
  state = null;
  emit();
}

export function resetDemo() {
  update(() => createSeedState());
}

const serverSnapshot = createSeedState("1970-01-01T00:00:00.000Z");

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    load,
    () => serverSnapshot,
  );
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => mode,
    () => ({ kind: "demo" }) as Mode,
  );
}

export function useActiveIndustry() {
  const s = useAppState();
  return s.industries.find((i) => i.id === s.activeIndustryId) ?? null;
}
