import { useState } from "react";
import { Copy, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, update } from "@/lib/legeseb/store";
import { uid, type Prospect } from "@/lib/legeseb/model";
import { generateDraft, type Channel, type Campaign } from "@/lib/legeseb/phase2";

export function OutreachDrafts({ prospect, campaign }: { prospect: Prospect; campaign: Campaign }) {
  const [channel, setChannel] = useState<Channel>("email");
  return <section className="space-y-3 border-t border-border pt-5">
    <h2 className="font-medium">Outreach drafts</h2>
    <div className="flex gap-2" role="group" aria-label="Draft channel">{(["email", "sms", "call"] as const).map(c => <Button key={c} variant={c === channel ? "default" : "outline"} aria-pressed={c === channel} onClick={() => setChannel(c)}>{c === "email" ? "Email" : c === "sms" ? "SMS" : "Call script"}</Button>)}</div>
    <DraftEditor key={`${prospect.id}-${campaign.id}-${channel}`} prospect={prospect} campaign={campaign} channel={channel} />
  </section>;
}
function DraftEditor({ prospect, campaign, channel }: { prospect: Prospect; campaign: Campaign; channel: Channel }) {
  const s = useAppState();
  const saved = s.drafts?.find(d => d.prospectId === prospect.id && d.campaignId === campaign.id && d.channel === channel);
  const generate = () => generateDraft(prospect, campaign, s.workspace, s.industries.find(i => i.id === campaign.industryId)?.name ?? "", channel);
  const [draft, setDraft] = useState(saved ? { subject: saved.subject, body: saved.body } : generate());
  const [status, setStatus] = useState("");
  const ready = !!(s.workspace.name.trim() && campaign.offering.trim() && campaign.objective.trim() && campaign.cta.trim());
  return <div className="space-y-3">
    <p className="text-xs text-muted-foreground">Draft only · {campaign.name} · Nothing is sent and no call is initiated. Confirm permission and review all facts before use.</p>
    {!ready && <p role="alert" className="text-sm">Complete client identity, actual services, objective and call to action before creating a draft.</p>}
    {channel === "email" && <label className="grid gap-1.5 text-sm">Subject<Input value={draft.subject} onChange={e => { setDraft(x => ({ ...x, subject: e.target.value })); setStatus("Unsaved changes"); }} /></label>}
    <label className="grid gap-1.5 text-sm">{channel === "call" ? "Call script draft" : "Message draft"}<Textarea aria-label={channel === "call" ? "Call script draft" : "Message draft"} rows={10} value={draft.body} onChange={e => { setDraft(x => ({ ...x, body: e.target.value })); setStatus("Unsaved changes"); }} /></label>
    <div className="flex flex-wrap gap-2">
      <Button disabled={!draft.body.trim()} onClick={() => {
        update(st => ({ ...st, drafts: [...(st.drafts ?? []).filter(d => !(d.prospectId === prospect.id && d.campaignId === campaign.id && d.channel === channel)), { ...draft, id: saved?.id ?? uid(), prospectId: prospect.id, campaignId: campaign.id, channel, updatedAt: new Date().toISOString() }] })); setStatus("Draft saved.");
      }}><Save className="h-4 w-4" />Save draft</Button>
      <Button variant="outline" disabled={!draft.body.trim()} onClick={async () => {
        try { await navigator.clipboard.writeText(channel === "email" ? `Subject: ${draft.subject}\n\n${draft.body}` : draft.body); setStatus("Copied."); } catch { setStatus("Copy unavailable. Select the draft text and copy it manually."); }
      }}><Copy className="h-4 w-4" />Copy</Button>
      <Button variant="outline" disabled={!ready} onClick={() => { if (!confirm("Replace this draft with the current template?")) return; setDraft(generate()); setStatus("Template refreshed; save to keep changes."); }}><RefreshCw className="h-4 w-4" />Refresh template</Button>
    </div>
    {status && <p role="status" className="text-sm">{status}</p>}
  </div>;
}