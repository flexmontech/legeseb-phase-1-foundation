import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, Plus } from "lucide-react";
import banner from "@/assets/industries.jpg";
import { INDUSTRY_CATALOG } from "@/lib/legeseb/industryCatalog";
import { useAppState, update, getState } from "@/lib/legeseb/store";
import { addIndustry, setActiveIndustry, type TargetType } from "@/lib/legeseb/model";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industry Explorer — LEGESEB" },
      { name: "description", content: "Search 165+ industries and businesses and turn any into a target market in one click." },
      { property: "og:title", content: "Industry Explorer — LEGESEB" },
      { property: "og:description", content: "Search every industry and business in your pipeline from one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explorer,
});

const B2B_HINT = /office|it |software|legal|account|consult|logistic|manufactur|wholesale|agency|b2b|commercial|construction|staffing|marketing/i;

function Explorer() {
  const s = useAppState();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const groups = useMemo(() => [...new Set(INDUSTRY_CATALOG.map((c) => c.group))].sort(), []);
  const ql = q.trim().toLowerCase();

  const catalog = INDUSTRY_CATALOG.filter(
    (c) => (group === "all" || c.group === group) && (!ql || `${c.name} ${c.group}`.toLowerCase().includes(ql)),
  );
  const businesses = ql
    ? s.prospects.filter((p) => `${p.businessName ?? ""} ${p.name} ${p.location ?? ""} ${p.notes}`.toLowerCase().includes(ql)).slice(0, 12)
    : [];
  const configured = (name: string) => s.industries.find((i) => i.name.toLowerCase() === name.toLowerCase());

  function target(name: string, group: string) {
    let ind = configured(name);
    if (!ind) {
      const type: TargetType = B2B_HINT.test(`${name} ${group}`) ? "B2B" : "B2C";
      update((st) => addIndustry(st, { name, services: [], prospectSingular: "Prospect", prospectPlural: "Prospects", targetType: type }));
      ind = getState().industries.find((i) => i.name === name);
    }
    if (ind) update((st) => setActiveIndustry(st, ind!.id));
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl">
        <img src={banner} alt="Tools from many local trades" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/85 to-sidebar/30" />
        <div className="relative p-8 text-sidebar-foreground md:p-12">
          <h1 className="text-3xl font-semibold md:text-4xl">Search all industries & businesses</h1>
          <p className="mt-2 max-w-xl opacity-85">Find an industry, make it your target in one click, then add or import prospects for it.</p>
          <label className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-card px-4 py-3 text-foreground shadow">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              aria-label="Search industries and businesses"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. dental, roofing, bakery, Wicker Park…"
              className="w-full bg-transparent outline-none"
            />
          </label>
        </div>
      </section>

      {businesses.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Businesses in your pipeline ({businesses.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((p) => (
              <Link key={p.id} to="/prospects/$id" params={{ id: p.id }} className="rounded-xl border border-border bg-card p-4 hover:shadow-md">
                <div className="font-medium">{p.businessName || p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.industries.find((i) => i.id === p.industryId)?.name} · {p.location || "No location"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Industries ({catalog.length})</h2>
          <select aria-label="Industry group" value={group} onChange={(e) => setGroup(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
            <option value="all">All groups</option>
            {groups.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        {catalog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No match. You can add any industry yourself in <Link to="/settings" className="text-accent underline">Settings</Link>.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalog.map((c) => {
              const ind = configured(c.name);
              const active = ind && s.activeIndustryId === ind.id;
              const n = ind ? s.prospects.filter((p) => p.industryId === ind.id).length : 0;
              return (
                <div key={`${c.group}-${c.name}`} className="flex flex-col rounded-xl border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">{c.group}</div>
                  <div className="mt-0.5 flex-1 font-medium">{c.name}</div>
                  {ind && <div className="text-xs text-muted-foreground">{n} prospects</div>}
                  <button
                    onClick={() => target(c.name, c.group)}
                    className={`mt-3 inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
                  >
                    {active ? <><Check className="h-4 w-4" /> Current target</> : <><Plus className="h-4 w-4" /> {ind ? "Set as target" : "Add as target"}</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
