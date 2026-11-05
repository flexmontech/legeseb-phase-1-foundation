import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProspectForm } from "@/components/legeseb/ProspectForm";
import { update, useAppState } from "@/lib/legeseb/store";
import { Qualification } from "@/components/legeseb/Qualification";
import { OutreachDrafts } from "@/components/legeseb/OutreachDrafts";
import { provenance } from "@/lib/legeseb/phase2";

export const Route = createFileRoute("/prospects/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Prospect details — LEGESEB" },
      { name: "description", content: "View and edit a prospect in LEGESEB." },
      { property: "og:title", content: "Prospect details — LEGESEB" },
      { property: "og:description", content: "View and edit a prospect in LEGESEB." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const s = useAppState();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const p = s.prospects.find((x) => x.id === id);

  if (!p)
    return (
      <div className="text-sm">
        Prospect not found. <Link to="/prospects" className="text-accent underline">Back to list</Link>
      </div>
    );

  const ind = s.industries.find((i) => i.id === p.industryId);
  const campaign = s.campaigns?.find(c => c.id === p.campaignId);
  const rows: [string, string | undefined][] = [
    ["Business", p.businessName],
    ["Industry", ind?.name],
    ["Type", p.type],
    ["Service", p.service],
    ["Stage", s.stages.find((x) => x.id === p.stageId)?.name],
    ["Lead source", p.source],
    ["Record source", provenance(p)],
    ["Source details", p.sourceDetail],
    ["Authorized source", p.authorizedSource === undefined ? "Unknown" : p.authorizedSource ? "Confirmed" : "Not confirmed"],
    ["Location", p.location],
    ["Email", p.email],
    ["Phone", p.phone],
    ["Website", p.website],
    ["Last updated", new Date(p.updatedAt).toLocaleString()],
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/prospects" className="text-sm text-accent underline">← All prospects</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {p.name} {p.demo && <Badge variant="secondary">Demo</Badge>}
        </h1>
        {!editing && (
          <div className="flex gap-2">
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!confirm(`Delete ${p.name}?`)) return;
                update((st) => ({ ...st, prospects: st.prospects.filter((x) => x.id !== p.id) }));
                nav({ to: "/prospects" });
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        {editing ? (
          <ProspectForm
            initial={p}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={(input) => {
              update((st) => ({
                ...st,
                prospects: st.prospects.map((x) => (x.id === p.id ? { ...x, ...input, updatedAt: new Date().toISOString() } : x)),
              }));
              setEditing(false);
            }}
          />
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm">{v || "—"}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Notes</dt>
              <dd className="whitespace-pre-wrap text-sm">{p.notes || "—"}</dd>
            </div>
          </dl>
        )}
      </div>
      {!editing && <>
        <label className="grid gap-1.5 text-sm">Campaign<select aria-label="Prospect campaign" className="h-9 rounded-md border border-input bg-card px-2 text-sm" value={p.campaignId ?? ""} onChange={e => update(st => ({ ...st, prospects: st.prospects.map(x => x.id === p.id ? { ...x, campaignId: e.target.value, updatedAt: new Date().toISOString() } : x) }))}>
          <option value="">Not assigned</option>{s.campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        {campaign ? <><Qualification prospect={p} campaign={campaign} /><OutreachDrafts prospect={p} campaign={campaign} /></> : <Link to="/discovery" className="text-sm text-primary underline">Find prospects & campaigns</Link>}
      </>}
    </div>
  );
}
