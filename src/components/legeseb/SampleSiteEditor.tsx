import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { update, useAppState } from "@/lib/legeseb/store";
import { uid, type Prospect } from "@/lib/legeseb/model";
import { fabricatedClaims, generateSampleSite, SAMPLE_LABEL, type SampleSite } from "@/lib/legeseb/sampleSite";

export function SampleSiteEditor({ prospect }: { prospect: Prospect }) {
  const s = useAppState();
  const site = s.sites?.find((x) => x.prospectId === prospect.id);
  const industry = s.industries.find((i) => i.id === prospect.industryId);
  return (
    <section className="space-y-3 border-t border-border pt-5">
      <h2 className="font-medium">Sample website</h2>
      <p className="text-xs text-muted-foreground">{SAMPLE_LABEL}. Only created when you choose to.</p>
      {site ? <Editor key={site.id} site={site} /> : (
        <Button variant="outline" onClick={() => update((st) => ({ ...st, sites: [...(st.sites ?? []), generateSampleSite(prospect, industry, st.workspace, uid())] }))}>
          Create sample website
        </Button>
      )}
    </section>
  );
}

function Editor({ site }: { site: SampleSite }) {
  const [d, setD] = useState({ headline: site.headline, intro: site.intro, services: site.services.join("\n"), cta: site.cta });
  const [status, setStatus] = useState("");
  const draft = { ...d, services: d.services.split("\n").map((x) => x.trim()).filter(Boolean) };
  const flagged = fabricatedClaims(draft);
  return (
    <div className="space-y-3">
      <label className="grid gap-1.5 text-sm">Headline<Input value={d.headline} onChange={(e) => setD({ ...d, headline: e.target.value })} /></label>
      <label className="grid gap-1.5 text-sm">Introduction<Textarea rows={4} value={d.intro} onChange={(e) => setD({ ...d, intro: e.target.value })} /></label>
      <label className="grid gap-1.5 text-sm">Services (one per line)<Textarea rows={4} value={d.services} onChange={(e) => setD({ ...d, services: e.target.value })} /></label>
      <label className="grid gap-1.5 text-sm">Button text<Input value={d.cta} onChange={(e) => setD({ ...d, cta: e.target.value })} /></label>
      {flagged.length > 0 && <p role="alert" className="text-sm text-destructive">Remove claims the business has not provided: {flagged.join(", ")}.</p>}
      <div className="flex flex-wrap gap-2">
        <Button disabled={flagged.length > 0 || !d.headline.trim()} onClick={() => {
          update((st) => ({ ...st, sites: (st.sites ?? []).map((x) => x.id === site.id ? { ...x, ...draft, updatedAt: new Date().toISOString() } : x) }));
          setStatus("Sample website saved.");
        }}>Save</Button>
        <Button variant="outline" asChild><Link to="/sample/$id" params={{ id: site.id }}>Preview</Link></Button>
        <Button variant="outline" onClick={() => {
          if (!confirm("Delete this sample website?")) return;
          update((st) => ({ ...st, sites: (st.sites ?? []).filter((x) => x.id !== site.id) }));
        }}>Delete</Button>
      </div>
      {status && <p role="status" className="text-sm">{status}</p>}
    </div>
  );
}
