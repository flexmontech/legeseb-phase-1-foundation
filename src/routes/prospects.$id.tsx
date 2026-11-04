import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProspectForm } from "@/components/legeseb/ProspectForm";
import { update, useAppState } from "@/lib/legeseb/store";

export const Route = createFileRoute("/prospects/$id")({
  head: () => ({
    meta: [
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
  const rows: [string, string | undefined][] = [
    ["Business", p.businessName],
    ["Industry", ind?.name],
    ["Type", p.type],
    ["Service", p.service],
    ["Stage", s.stages.find((x) => x.id === p.stageId)?.name],
    ["Lead source", p.source],
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
    </div>
  );
}
