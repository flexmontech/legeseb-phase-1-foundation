import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampaignEditor } from "@/components/legeseb/CampaignEditor";
import { CSVImport } from "@/components/legeseb/CSVImport";
import { AudienceTarget } from "@/components/legeseb/AudienceTarget";
import { LeadSearch } from "@/components/legeseb/LeadSearch";
import { ProspectForm } from "@/components/legeseb/ProspectForm";
import { update, useAppState } from "@/lib/legeseb/store";
import { uid, setActiveIndustry } from "@/lib/legeseb/model";
import { provenance, qualify } from "@/lib/legeseb/phase2";

export const Route = createFileRoute("/discovery")({
  head: () => ({ meta: [
    { title: "Lead Finder — LEGESEB" }, { name: "description", content: "Choose your audience and industry, search real business listings, import leads and qualify prospects in LEGESEB." },
    { property: "og:title", content: "Lead Finder — LEGESEB" }, { property: "og:description", content: "Industry targeting, live business search, campaign qualification and authorized CSV imports in one place." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Discovery,
});
function Discovery() {
  const s = useAppState();
  const active = s.industries.find(i => i.id === s.activeIndustryId);
  const campaigns = s.campaigns ?? [];
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState<"new" | "edit" | null>(null);
  const [mode, setMode] = useState<"list" | "manual" | "csv">("list");
  const [location, setLocation] = useState("");
  const [minimum, setMinimum] = useState(0);
  const [source, setSource] = useState("");
  const [onlyAssigned, setOnlyAssigned] = useState(false);
  const [status, setStatus] = useState("");
  const c = campaigns.find(x => x.id === selected) ?? campaigns[0];
  const candidates = c ? s.prospects.filter(p => p.industryId === c.industryId && p.type === c.type && (!onlyAssigned || p.campaignId === c.id) && (!source || provenance(p) === source) && (!location.trim() || p.location?.toLowerCase().includes(location.trim().toLowerCase()))).map(p => ({ p, score: qualify(p, c) })).filter(x => minimum === 0 || (x.score.score !== null && x.score.score >= minimum)) : [];
  return <div className="space-y-5">
    <h1 className="text-2xl font-semibold">Lead Finder</h1>
    <AudienceTarget />
    {active ? <LeadSearch key={active.id} industry={active} /> : <p className="text-sm text-muted-foreground">Select a target industry to search real businesses.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><h2 className="text-lg font-semibold">Campaigns & sourcing</h2><Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />New campaign</Button></div>
    {editing && <CampaignEditor key={editing === "edit" ? c?.id : "new"} initial={editing === "edit" ? c : undefined} onClose={id => { setEditing(null); if (id) setSelected(id); }} />}
    {campaigns.length === 0 && !editing && <p className="text-sm text-muted-foreground">No campaigns yet.</p>}
    {c && <>
      <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1.5 text-sm">Campaign<select aria-label="Campaign" className="h-9 max-w-full rounded-md border border-input bg-card px-2 text-sm" value={c.id} onChange={e => { setSelected(e.target.value); setMode("list"); setStatus(""); }}>{campaigns.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label><Button variant="outline" onClick={() => setEditing("edit")}><Pencil className="h-4 w-4" />Edit campaign</Button><Button variant="outline" onClick={() => update(st => setActiveIndustry(st, c.industryId))}>Use campaign industry for search</Button></div>
      <dl className="grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-3">{[["Offering", c.offering], ["Industry / type", `${s.industries.find(i => i.id === c.industryId)?.name ?? c.industryId} · ${c.type}`], ["Target location", c.location || "Any / unknown"], ["Objective", c.objective], ["Call to action", c.cta]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-words">{v}</dd></div>)}</dl>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sourcing mode">{(["list", "manual", "csv"] as const).map(m => <Button key={m} variant={mode === m ? "default" : "outline"} aria-pressed={mode === m} onClick={() => { setMode(m); setStatus(""); }}>{m === "list" ? "Saved prospects" : m === "manual" ? "Manual entry" : "CSV import"}</Button>)}</div>
      <p className="text-xs text-muted-foreground">{c.type === "B2C" ? "B2C imports must be authorized client-provided or consent-based; business directories do not supply consumer leads." : "Campaign matching uses saved prospects. Live business search results appear above and are saved only when selected."}</p>
      {mode === "manual" && <ProspectForm key={c.id} initial={{ campaignId: c.id, industryId: c.industryId, type: c.type, recordSource: "Manual" }} submitLabel="Save prospect" onCancel={() => setMode("list")} onSubmit={input => {
        const now = new Date().toISOString(); update(st => ({ ...st, prospects: [{ ...input, recordSource: "Manual", id: uid(), workspaceId: st.workspace.id, createdAt: now, updatedAt: now }, ...st.prospects] })); setMode("list"); setStatus("Prospect saved.");
      }} />}
      {mode === "csv" && <CSVImport key={c.id} campaign={c} />}
      {mode === "list" && <>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">Location filter<Input value={location} onChange={e => setLocation(e.target.value)} /></label>
          <label className="grid w-36 gap-1.5 text-sm">Minimum match %<Input type="number" min={0} max={100} value={minimum} onChange={e => setMinimum(Math.min(100, Math.max(0, Number(e.target.value))))} /></label>
          <label className="grid gap-1.5 text-sm">Record source<select className="h-9 rounded-md border border-input bg-card px-2 text-sm" value={source} onChange={e => setSource(e.target.value)}><option value="">All sources</option>{["Manual", "Imported", "Demo", "Connected provider"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={onlyAssigned} onChange={e => setOnlyAssigned(e.target.checked)} />Assigned to this campaign only</label>
        </div>
        <p className="text-sm text-muted-foreground">{candidates.length} matching saved records</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted text-xs text-muted-foreground"><tr><th className="p-3">Prospect</th><th className="p-3">Location</th><th className="p-3">Source</th><th className="p-3">Match / coverage</th><th className="p-3">Campaign</th></tr></thead><tbody>{candidates.map(({ p, score }) => <tr key={p.id} className="border-t border-border">
          <td className="p-3"><Link to="/prospects/$id" params={{ id: p.id }} className="font-medium text-primary hover:underline">{p.name}</Link></td><td className="p-3">{p.location || "Unknown"}</td><td className="p-3">{provenance(p)}</td><td className="p-3">{score.score === null ? "Unknown" : `${score.score}%`} / {score.coverage}%</td>
          <td className="p-3">{p.campaignId === c.id ? "Assigned" : <Button size="sm" variant="outline" onClick={() => { update(st => ({ ...st, prospects: st.prospects.map(x => x.id === p.id ? { ...x, campaignId: c.id, updatedAt: new Date().toISOString() } : x) })); setStatus("Prospect assigned to campaign."); }}>{p.campaignId ? "Reassign" : "Assign"}</Button>}</td>
        </tr>)}</tbody></table></div>
        {!candidates.length && <p className="text-sm text-muted-foreground">No prospects match these filters.</p>}
      </>}
    </>}
    {status && <p role="status" className="text-sm">{status}</p>}
  </div>;
}