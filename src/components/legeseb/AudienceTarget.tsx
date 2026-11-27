import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { INDUSTRY_CATALOG } from "@/lib/legeseb/industryCatalog";
import { addIndustry, setActiveIndustry, type TargetType } from "@/lib/legeseb/model";
import { update, useAppState } from "@/lib/legeseb/store";

const B2B_HINT = /office|it |software|legal|account|consult|logistic|manufactur|wholesale|agency|b2b|commercial|construction|staffing|marketing/i;

export function AudienceTarget() {
  const s = useAppState();
  const [query, setQuery] = useState("");
  const active = s.industries.find(i => i.id === s.activeIndustryId);
  const catalog = INDUSTRY_CATALOG.filter(c => !s.industries.some(i => i.name.toLowerCase() === c.name.toLowerCase()));
  const matches = (name: string) => !query || name.toLowerCase().includes(query.toLowerCase());

  function target(name: string) {
    if (!name) return;
    update(st => {
      const existing = st.industries.find(i => i.name === name);
      if (existing) return setActiveIndustry(st, existing.id);
      const item = INDUSTRY_CATALOG.find(i => i.name === name);
      if (!item) return st;
      const next = addIndustry(st, {
        name, services: [], prospectSingular: "Prospect", prospectPlural: "Prospects",
        targetType: B2B_HINT.test(`${name} ${item.group}`) ? "B2B" : "B2C",
      });
      const added = next.industries.find(i => i.name === name);
      return added ? setActiveIndustry(next, added.id) : next;
    });
    setQuery("");
  }

  return <section className="space-y-4 border-y border-border py-5">
    <h2 className="font-semibold">Clients & audiences</h2>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <div><span className="text-muted-foreground">Client: </span>{s.workspace.name}</div>
      <Link to="/settings" className="text-primary underline">Edit client profile</Link>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="grid gap-1.5 text-sm">Search industries
        <Input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. dental, roofing, IT…" />
      </label>
      <label className="grid min-w-0 gap-1.5 text-sm">Target industry
        <select className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2" value={active?.name ?? ""} onChange={e => target(e.target.value)}>
          <option value="">Select an industry</option>
          <optgroup label="Your target industries">{s.industries.filter(i => i.id === active?.id || matches(i.name)).map(i => <option key={i.id} value={i.name}>{i.name}</option>)}</optgroup>
          <optgroup label="Industry catalog">{catalog.filter(i => matches(i.name)).map(i => <option key={i.name} value={i.name}>{i.name}</option>)}</optgroup>
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">Target audience
        <select disabled={!active} className="h-9 rounded-md border border-input bg-background px-2" value={active?.targetType ?? "B2B"} onChange={e => {
          const targetType = e.target.value as TargetType;
          update(st => ({ ...st, industries: st.industries.map(i => i.id === active?.id ? { ...i, targetType } : i) }));
        }}>
          <option value="B2B">B2B — businesses</option><option value="B2C">B2C — consumers</option>
        </select>
      </label>
    </div>
    {active && <p className="text-sm text-muted-foreground">{s.prospects.filter(p => p.industryId === active.id).length} saved prospects · {active.name} · {active.targetType}</p>}
    {active?.targetType === "B2C" && <p className="text-sm text-muted-foreground">Consumer contacts must come from authorized client lists or consent-based sources. Google Maps returns businesses, not consumer leads.</p>}
  </section>;
}