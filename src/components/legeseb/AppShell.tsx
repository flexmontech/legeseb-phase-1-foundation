import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Users, KanbanSquare, Settings } from "lucide-react";
import { useAppState, update } from "@/lib/legeseb/store";
import { ALL, setActiveIndustry } from "@/lib/legeseb/model";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function IndustrySelect() {
  const s = useAppState();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-muted-foreground">Target industry</span>
      <select
        aria-label="Target industry"
        className="h-9 rounded-md border border-input bg-card px-2 text-sm"
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground md:w-56 md:shrink-0">
        <div className="px-5 py-4 text-lg font-bold tracking-widest">LEGESEB</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:px-8">
          <div className="text-sm">
            <span className="text-muted-foreground">Workspace: </span>
            <span className="font-medium">{mounted ? s.workspace.name : ""}</span>
          </div>
          {mounted && <IndustrySelect />}
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{mounted ? children : null}</main>
        <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground md:px-8">
          LEGESEB · Phase 1 foundation · Data is saved in this browser only
        </footer>
      </div>
    </div>
  );
}
