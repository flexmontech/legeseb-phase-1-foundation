import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAppState, update, useMode } from "@/lib/legeseb/store";
import { supabase } from "@/integrations/supabase/client";
import { closeWorkspace, lastWorkspaceId, openWorkspace } from "@/lib/legeseb/workspaces";
import { ALL, setActiveIndustry } from "@/lib/legeseb/model";
import { Button } from "@/components/ui/button";

// One business workflow; the homepage remains reachable through the brand and Public site.
const NAV = [
  { to: "/discovery", label: "Lead Finder" },
  { to: "/prospects", label: "Prospects" },
  { to: "/pipeline", label: "Outreach & Pipeline" },
  { to: "/settings", label: "Settings" },
] as const;

export function IndustrySelect() {
  const s = useAppState();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-muted-foreground">Target industry</span>
      <select
        aria-label="Target industry"
        className="h-9 max-w-[14rem] rounded-md border border-input bg-card px-2 text-sm text-foreground"
        value={s.activeIndustryId}
        onChange={(e) => update((st) => setActiveIndustry(st, e.target.value))}
      >
        <option value={ALL}>All industries</option>
        {s.industries.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>
    </label>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const last = lastWorkspaceId();
    if (last) supabase.auth.getUser().then(({ data }) => { if (data.user) openWorkspace(last).catch(() => closeWorkspace()); });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") closeWorkspace(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  const mode = useMode();
  const s = useAppState();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const fullBleed = path === "/";
  const isPublic = path === "/" || path.startsWith("/auth") || path.startsWith("/sample/");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="min-w-0 truncate text-lg font-bold text-sidebar-foreground">Plutonium31</Link>
          <nav aria-label="Main" className="hidden gap-1 lg:flex">
            {NAV.map(({ to, label }) => (
              <Button key={to} asChild variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-foreground/15 hover:text-sidebar-foreground">
                <Link to={to} activeProps={{ className: "bg-card !text-destructive" }}>{label}</Link>
              </Button>
            ))}
          </nav>
          <Button asChild variant="ghost" className="shrink-0 border border-sidebar-foreground/40 text-sidebar-foreground hover:bg-sidebar-foreground/15 hover:text-sidebar-foreground">
            <Link to={isPublic ? "/discovery" : "/"}>{isPublic ? "Open app" : "← Public site"}</Link>
          </Button>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:hidden">
          {NAV.map(({ to, label }) => (
            <Button key={to} asChild variant="ghost" size="sm" className="shrink-0 text-sidebar-foreground hover:bg-sidebar-foreground/15 hover:text-sidebar-foreground">
              <Link to={to} activeProps={{ className: "bg-card !text-destructive" }}>{label}</Link>
            </Button>
          ))}
        </nav>
      </header>
      {mounted && !isPublic && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground md:px-8">
          <span className="min-w-0 break-words">{s.workspace.name} · {mode.kind === "cloud" ? "Live workspace" : "Demo (this browser)"}</span>
          {path !== "/discovery" && <IndustrySelect />}
        </div>
      )}
      <main className={fullBleed ? "flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8"}>
        {mounted ? children : null}
      </main>
      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-8">
        Plutonium31 · Lead generation for every industry{isPublic ? "" : <> · {mode.kind === "cloud" ? "Live workspace saved online, visible only to its members" : "Demo data is saved in this browser only"}</>}
      </footer>
    </div>
  );
}
