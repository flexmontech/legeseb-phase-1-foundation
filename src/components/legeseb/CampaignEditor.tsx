import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, update } from "@/lib/legeseb/store";
import { uid, type TargetType } from "@/lib/legeseb/model";
import { defaultCriteria, FACTOR_FIELDS, type Campaign, type FactorField } from "@/lib/legeseb/phase2";
import { Plus, Trash2 } from "lucide-react";

const sel = "h-9 w-full rounded-md border border-input bg-card px-2 text-sm";
export function CampaignEditor({ initial, onClose }: { initial?: Campaign; onClose: (id?: string) => void }) {
  const s = useAppState();
  const industryId = s.activeIndustryId !== "all" ? s.activeIndustryId : s.industries[0]?.id ?? "general";
  const type = s.industries.find(i => i.id === industryId)?.targetType ?? "B2C";
  const [c, setC] = useState<Campaign>(initial ?? { id: uid(), name: "", offering: "", industryId, type, location: "", objective: "", cta: "", webReadiness: false, criteria: defaultCriteria(industryId, type) });
  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setC(x => ({ ...x, [k]: v }));
  return <form className="space-y-4 border-y border-border py-5" onSubmit={e => {
    e.preventDefault();
    const saved = { ...c, name: c.name.trim(), offering: c.offering.trim(), objective: c.objective.trim(), cta: c.cta.trim() };
    if (!saved.name || !saved.offering || !saved.objective || !saved.cta) return;
    update(st => ({ ...st, campaigns: [...(st.campaigns ?? []).filter(x => x.id !== c.id), saved] })); onClose(c.id);
  }}>
    <h2 className="font-medium">{initial ? "Edit campaign" : "New campaign"}</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Campaign name *"><Input required value={c.name} onChange={e => set("name", e.target.value)} /></Field>
      <Field label="Client offering / actual services *"><Input required value={c.offering} onChange={e => set("offering", e.target.value)} /></Field>
      <Field label="Campaign industry"><select className={sel} value={c.industryId} onChange={e => {
        const id = e.target.value; const t = s.industries.find(i => i.id === id)?.targetType ?? c.type;
        setC(x => ({ ...x, industryId: id, type: t, criteria: x.criteria.map(f => f.field === "industryId" ? { ...f, expected: id } : f.field === "type" ? { ...f, expected: t } : f) }));
      }}>{s.industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></Field>
      <Field label="Campaign target type"><select className={sel} value={c.type} onChange={e => {
        const t = e.target.value as TargetType; setC(x => ({ ...x, type: t, criteria: x.criteria.map(f => f.field === "type" ? { ...f, expected: t } : f) }));
      }}><option>B2B</option><option>B2C</option></select></Field>
      <Field label="Target location"><Input value={c.location} onChange={e => {
        const location = e.target.value; setC(x => ({ ...x, location, criteria: x.criteria.some(f => f.field === "location") ? x.criteria.map(f => f.field === "location" ? { ...f, expected: location } : f) : [...x.criteria, { id: uid(), field: "location", label: "Location match", expected: location, points: 20 }] }));
      }} /></Field>
      <Field label="Call to action *"><Input required value={c.cta} onChange={e => set("cta", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Campaign objective *"><Textarea required value={c.objective} onChange={e => set("objective", e.target.value)} /></Field></div>
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.webReadiness} onChange={e => {
      const checked = e.target.checked;
      setC(x => ({ ...x, webReadiness: checked, criteria: checked ? [...x.criteria, ...(["website", "https"] as const).filter(field => !x.criteria.some(f => f.field === field)).map(field => ({ id: uid(), field, label: FACTOR_FIELDS.find(f => f.field === field)?.label ?? field, expected: "", points: 10 }))] : x.criteria }));
    }} />Include Web Readiness (supplied URL checks only)</label>
    <h3 className="text-sm font-medium">Qualification criteria</h3>
    {c.criteria.filter(f => c.webReadiness || (f.field !== "website" && f.field !== "https")).map(f => <div key={f.id} className="grid grid-cols-[1fr_5rem_2.5rem] gap-2 sm:grid-cols-[1fr_1fr_5rem_2.5rem]">
      <select className={sel} aria-label="Criterion factor" value={f.field} onChange={e => set("criteria", c.criteria.map(x => x.id === f.id ? { ...x, field: e.target.value as FactorField, label: FACTOR_FIELDS.find(o => o.field === e.target.value)?.label ?? "Factor", expected: "" } : x))}>
        {FACTOR_FIELDS.filter(o => c.webReadiness || (o.field !== "website" && o.field !== "https")).map(o => <option key={o.field} value={o.field}>{o.label}</option>)}
      </select>
      <Input className="col-span-3 row-start-2 sm:col-span-1 sm:row-auto" aria-label={`Expected value for ${f.label}`} placeholder="Expected value" disabled={["email", "phone", "authorizedSource", "website", "https"].includes(f.field)} value={f.expected} onChange={e => set("criteria", c.criteria.map(x => x.id === f.id ? { ...x, expected: e.target.value } : x))} />
      <Input type="number" min={0} max={1000} step={1} aria-label={`Points for ${f.label}`} value={f.points} onChange={e => set("criteria", c.criteria.map(x => x.id === f.id ? { ...x, points: Number(e.target.value) } : x))} />
      <Button type="button" variant="ghost" size="icon" title="Remove criterion" aria-label="Remove criterion" onClick={() => set("criteria", c.criteria.filter(x => x.id !== f.id))}><Trash2 className="h-4 w-4" /></Button>
    </div>)}
    <Button type="button" variant="outline" onClick={() => set("criteria", [...c.criteria, { id: uid(), field: "service", label: "Service interest match", expected: "", points: 10 }])}><Plus className="h-4 w-4" />Add criterion</Button>
    <div className="flex gap-2"><Button type="submit">Save campaign</Button><Button type="button" variant="outline" onClick={() => onClose()}>Cancel</Button></div>
  </form>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>; }