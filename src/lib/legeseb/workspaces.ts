import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { ALL, DEFAULT_STAGES, PRESETS, type AppState } from "./model";
import { activateCloudWorkspace, activateDemoWorkspace } from "./store";

const LAST = "legeseb:lastWorkspace";

/** A new live workspace starts clean: presets and stages, no prospects or demo data. */
export function createBlankState(id: string, name: string): AppState {
  return {
    version: 1,
    workspace: { id, name, description: "", contactEmail: "" },
    activeIndustryId: ALL,
    industries: PRESETS.map((p) => ({ ...p })),
    stages: DEFAULT_STAGES.map((s) => ({ ...s })),
    prospects: [],
    campaigns: [],
    drafts: [],
    sites: [],
  };
}

export async function listWorkspaces() {
  const { data, error } = await supabase.from("workspaces").select("id, name, created_at").order("created_at");
  if (error) throw error;
  return data;
}

export async function createWorkspace(name: string) {
  const { data, error } = await supabase.rpc("create_workspace", {
    _name: name,
    _state: createBlankState("pending", name) as unknown as Json,
  });
  if (error) throw error;
  return data as string;
}

export async function openWorkspace(id: string) {
  const [{ data: ws, error: e1 }, { data: st, error: e2 }] = await Promise.all([
    supabase.from("workspaces").select("id, name").eq("id", id).single(),
    supabase.from("workspace_state").select("state").eq("workspace_id", id).single(),
  ]);
  if (e1 || e2 || !ws || !st) throw e1 ?? e2 ?? new Error("Workspace not available");
  const data = st.state as unknown as AppState;
  data.workspace = { ...data.workspace, id: ws.id, name: data.workspace?.name || ws.name };
  activateCloudWorkspace(ws.id, ws.name, data, async (s) => {
    const { error } = await supabase.from("workspace_state")
      .update({ state: s as unknown as Json, updated_at: new Date().toISOString() })
      .eq("workspace_id", ws.id);
    if (error) console.error("Workspace save failed", error);
  });
  localStorage.setItem(LAST, id);
}

export function lastWorkspaceId() {
  try { return localStorage.getItem(LAST); } catch { return null; }
}

export function closeWorkspace() {
  try { localStorage.removeItem(LAST); } catch { /* ignore */ }
  activateDemoWorkspace();
}
