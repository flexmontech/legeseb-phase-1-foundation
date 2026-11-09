import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAppState, update, useMode } from "@/lib/legeseb/store";
import { supabase } from "@/integrations/supabase/client";
import { closeWorkspace, lastWorkspaceId, openWorkspace } from "@/lib/legeseb/workspaces";
import { ALL, setActiveIndustry } from "@/lib/legeseb/model";
import { Lock } from "lucide-react";

// Public lane: what visitors see. The operator portal is a separate, secondary bar.
const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/audiences", label: "Clients & Audiences" },
  { to: "/industries", label: "Industry Explorer" },
  { to: "/showcase", label: "Sample Showcase" },
] as const;

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/discovery", label: "Find Prospects" },
  { to: "/prospects", label: "Prospects" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/settings", label: "Settings" },
  { to: "/internal", label: "Internal" },
  { to: "/workspaces", label: "Workspaces" },
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
  const isPublic = PUBLIC_NAV.some((n) => n.to === path) || path.startsWith("/auth");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="text-lg font-bold tracking-[0.3em] text-sidebar-foreground">LEGESEB</Link>
          <nav aria-label="Main" className="hidden gap-1 lg:flex">
            {PUBLIC_NAV.map(({ to, label }) => (
              <Link key={to} to={to} activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-foreground/15"
                activeProps={{ className: "bg-card !text-destructive font-semibold shadow-sm" }}>{label}</Link>
            ))}
          </nav>
          <Link to={isPublic ? "/dashboard" : "/"}
            className="whitespace-nowrap rounded-md border border-sidebar-foreground/40 px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-foreground/15">
            {isPublic ? "Operator Portal" : "← Public site"}
          </Link>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:hidden">
          {PUBLIC_NAV.map(({ to, label }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-foreground/15"
              activeProps={{ className: "bg-card !text-destructive font-semibold shadow-sm" }}>{label}</Link>
          ))}
        </nav>
      </header>
      {!isPublic && (
        <div className="border-b border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-8">
            <nav aria-label="Operator portal" className="flex gap-1 overflow-x-auto">
              {NAV.map(({ to, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary !text-foreground font-semibold" }}>
                  {to === "/internal" && <Lock className="h-3.5 w-3.5" />} {label}
                </Link>
              ))}
            </nav>
            {mounted && (
              <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                <span>{s.workspace.name} · {mode.kind === "cloud" ? "Live workspace" : "Demo (this browser)"}</span>
                <IndustrySelect />
              </div>
            )}
          </div>
        </div>
      )}
      {mounted && !isPublic && (
        <div className="border-b border-border bg-card px-4 py-2 md:hidden">
          <IndustrySelect />
        </div>
      )}
      <main className={fullBleed ? "flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8"}>
        {mounted ? children : null}
      </main>
      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-8">
        LEGESEB · Lead generation for every industry{isPublic ? "" : <> · {mode.kind === "cloud" ? "Live workspace saved online, visible only to its members" : "Demo data is saved in this browser only"}</>}
      </footer>
    </div>
  );
}
