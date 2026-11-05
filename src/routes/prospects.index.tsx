import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProspectForm } from "@/components/legeseb/ProspectForm";
import { update, useAppState, useActiveIndustry } from "@/lib/legeseb/store";
import { filterByIndustry, uid } from "@/lib/legeseb/model";
import { provenance } from "@/lib/legeseb/phase2";

export const Route = createFileRoute("/prospects/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Prospects — LEGESEB" },
      { name: "description", content: "Search, filter and manage prospects in LEGESEB." },
      { property: "og:title", content: "Prospects — LEGESEB" },
      { property: "og:description", content: "Search, filter and manage prospects in LEGESEB." },
    ],
  }),
  component: Prospects,
});

const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

function Prospects() {
  const s = useAppState();
  const ind = useActiveIndustry();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [adding, setAdding] = useState(false);
  const plural = ind?.prospectPlural ?? "Prospects";
  const singular = ind?.prospectSingular ?? "Prospect";

  const needle = q.toLowerCase();
  const list = filterByIndustry(s.prospects, s.activeIndustryId).filter(
    (p) =>
      (!type || p.type === type) &&
      (!stage || p.stageId === stage) &&
      (!needle ||
        [p.name, p.businessName, p.email, p.notes].some((x) => x?.toLowerCase().includes(needle))),
  );
  const indName = (id: string) => s.industries.find((i) => i.id === id)?.name ?? "Unknown";
  const stageName = (id: string) => s.stages.find((x) => x.id === id)?.name ?? "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{plural}</h1>
        {!adding && <Button onClick={() => setAdding(true)}>Add {singular.toLowerCase()}</Button>}
      </div>

      {adding && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-medium">New {singular.toLowerCase()}</h2>
          <ProspectForm
            submitLabel="Save"
            onCancel={() => setAdding(false)}
            onSubmit={(input) => {
              const now = new Date().toISOString();
              update((st) => ({
                ...st,
                prospects: [{ ...input, id: uid(), workspaceId: st.workspace.id, createdAt: now, updatedAt: now }, ...st.prospects],
              }));
              setAdding(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search name, business, email, notes" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select className={sel} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type filter">
          <option value="">All types</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        <select className={sel} value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Stage filter">
          <option value="">All stages</option>
          {s.stages.map((x) => (
            <option key={x.id} value={x.id}>{x.name}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No {plural.toLowerCase()} match these filters.{" "}
          {(q || type || stage) && (
            <button className="text-accent underline" onClick={() => { setQ(""); setType(""); setStage(""); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Business</th>
                <th className="p-3">Industry</th>
                <th className="p-3">Type</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Source</th>
                 <th className="p-3">Record source</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <Link to="/prospects/$id" params={{ id: p.id }} className="font-medium text-primary underline-offset-2 hover:underline">
                      {p.name}
                    </Link>
                    {p.demo && <Badge variant="secondary" className="ml-2">Demo</Badge>}
                  </td>
                  <td className="p-3">{p.businessName || "—"}</td>
                  <td className="p-3">{indName(p.industryId)}</td>
                  <td className="p-3">{p.type}</td>
                  <td className="p-3">{stageName(p.stageId)}</td>
                  <td className="p-3">{p.source}</td>
                   <td className="p-3">{provenance(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
