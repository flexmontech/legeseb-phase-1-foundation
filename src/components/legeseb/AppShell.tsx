import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAppState, update } from "@/lib/legeseb/store";
import { ALL, setActiveIndustry } from "@/lib/legeseb/model";
import { Lock } from "lucide-react";

// Sequenced: public pages first, then the working tools, then the locked room.
const NAV = [
  { to: "/", label: "Home" },
  { to: "/audiences", label: "Clients & Audiences" },
  { to: "/industries", label: "Industry Explorer" },
  { to: "/discovery", label: "Find Prospects" },
  { to: "/prospects", label: "Prospects" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
  { to: "/internal", label: "Internal" },
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
  useEffect(() => setMounted(true), []);
  const s = useAppState();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const fullBleed = path === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="text-lg font-bold tracking-[0.3em] text-primary">LEGESEB</Link>
          {mounted && !fullBleed && (
            <div className="hidden items-center gap-3 text-xs md:flex">
              <span className="opacity-70">{s.workspace.name}</span>
              <IndustrySelect />
            </div>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:px-6">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-destructive hover:bg-secondary"
              activeProps={{ className: "bg-destructive/10 !text-destructive font-semibold" }}
            >
              {to === "/internal" && <Lock className="h-3.5 w-3.5" />} {label}
            </Link>
          ))}
        </nav>
      </header>
      {mounted && !fullBleed && (
        <div className="border-b border-border bg-card px-4 py-2 md:hidden">
          <IndustrySelect />
        </div>
      )}
      <main className={fullBleed ? "flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8"}>
        {mounted ? children : null}
      </main>
      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-8">
        LEGESEB · Lead generation for every industry · Data is saved in this browser only
      </footer>
    </div>
  );
}
