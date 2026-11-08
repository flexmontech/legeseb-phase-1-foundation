import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { closeWorkspace, createWorkspace, listWorkspaces, openWorkspace } from "@/lib/legeseb/workspaces";
import { useMode } from "@/lib/legeseb/store";

export const Route = createFileRoute("/_authenticated/workspaces")({
  head: () => ({
    meta: [
      { title: "Client workspaces — LEGESEB" },
      { name: "description", content: "Create and open private LEGESEB client workspaces." },
      { property: "og:title", content: "Client workspaces — LEGESEB" },
      { property: "og:description", content: "Create and open private LEGESEB client workspaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Workspaces,
});

function Workspaces() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const mode = useMode();
  const { data, isLoading, error } = useQuery({ queryKey: ["workspaces"], queryFn: listWorkspaces });
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function open(id: string) {
    try { await openWorkspace(id); nav({ to: "/dashboard" }); } catch { setMsg("That workspace could not be opened."); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Client workspaces</h1>
        <p className="mt-1 text-sm text-muted-foreground">Each workspace is saved online and only its members can see its records. New workspaces start empty — demo data stays in the Chicago demo.</p>
      </div>
      <form className="flex gap-2" onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try { const id = await createWorkspace(name.trim()); setName(""); await qc.invalidateQueries({ queryKey: ["workspaces"] }); await open(id); }
        catch { setMsg("Could not create the workspace."); }
      }}>
        <Input aria-label="New workspace name" placeholder="Client business name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Create workspace</Button>
      </form>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        <li className="flex items-center justify-between gap-3 p-4">
          <div><p className="font-medium">Chicago Pilot (demo)</p><p className="text-xs text-muted-foreground">Saved in this browser only</p></div>
          <Button variant={mode.kind === "demo" ? "default" : "outline"} onClick={() => { closeWorkspace(); nav({ to: "/dashboard" }); }}>{mode.kind === "demo" ? "Open (current)" : "Open"}</Button>
        </li>
        {isLoading && <li className="p-4 text-sm">Loading…</li>}
        {error && <li className="p-4 text-sm">Workspaces could not be loaded.</li>}
        {data?.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-3 p-4">
            <div><p className="font-medium">{w.name}</p><p className="text-xs text-muted-foreground">Live workspace · created {new Date(w.created_at).toLocaleDateString()}</p></div>
            <Button variant={mode.kind === "cloud" && mode.workspaceId === w.id ? "default" : "outline"} onClick={() => open(w.id)}>
              {mode.kind === "cloud" && mode.workspaceId === w.id ? "Open (current)" : "Open"}
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" onClick={async () => {
        await qc.cancelQueries(); qc.clear(); closeWorkspace();
        await supabase.auth.signOut(); nav({ to: "/auth", replace: true });
      }}>Sign out</Button>
    </div>
  );
}
