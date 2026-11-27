import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchLeads, type FoundBusiness } from "@/lib/legeseb/leadSearch.functions";
import { update, useAppState, useMode } from "@/lib/legeseb/store";
import { uid, type Industry } from "@/lib/legeseb/model";

/** Real business search for one industry; results become prospects only when the user saves them. */
export function LeadSearch({ industry }: { industry: Industry }) {
  const s = useAppState();
  const mode = useMode();
  const [location, setLocation] = useState("Chicago, IL");
  const run = useServerFn(searchLeads);
  const m = useMutation({ mutationFn: () => run({ data: { industry: industry.name, location } }) });
  const saved = (b: FoundBusiness) => s.prospects.some((p) => p.sourceDetail?.includes(b.placeId) || (p.businessName ?? p.name).toLowerCase() === b.name.toLowerCase());

  function save(b: FoundBusiness) {
    const now = new Date().toISOString();
    update((st) => ({ ...st, prospects: [{
      id: uid(), workspaceId: st.workspace.id, name: b.name, businessName: b.name, industryId: industry.id, type: industry.targetType,
      phone: b.phone || undefined, website: b.website || undefined, location: b.address, source: "Google Maps",
      recordSource: "Connected provider", sourceDetail: `Google Maps listing ${b.placeId} ${b.mapsUrl}`.trim(),
      stageId: st.stages[0]?.id ?? "discovered", notes: "Public business listing from Google Maps. Not a verified personal contact.",
      createdAt: now, updatedAt: now,
    }, ...st.prospects] }));
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
        <label className="grid gap-1.5 text-sm">Location
          <input required minLength={2} value={location} onChange={(e) => setLocation(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
        </label>
        <button type="submit" disabled={m.isPending} className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find leads for {industry.name} now
        </button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">Searches public Google Maps business listings (up to 20 per search). Businesses only, never private consumer contacts.</p>
      {m.isError && <p className="mt-3 text-sm text-destructive">Please <Link to="/auth" className="underline">sign in</Link> to search for real leads.</p>}
      {m.data?.error && <p className="mt-3 text-sm text-destructive">{m.data.error}</p>}
      {m.data && !m.data.error && m.data.results.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No businesses found. Try a wider location.</p>}
      {m.data && m.data.results.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {m.data.results.map((b) => (
            <li key={b.placeId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{b.name}</div>
                <div className="truncate text-xs text-muted-foreground">{b.address}{b.phone && ` · ${b.phone}`}</div>
                {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-xs text-accent underline">{b.website}</a>}
              </div>
              {saved(b) ? <span className="shrink-0 text-xs text-muted-foreground">Saved</span> : (
                <button onClick={() => save(b)} className="shrink-0 rounded-full border border-border px-3 py-1 text-sm hover:bg-muted">Save as prospect</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {mode.kind === "demo" && m.data && m.data.results.length > 0 && <p className="mt-2 text-xs text-muted-foreground">You're in the demo workspace; saved leads stay in this browser.</p>}
    </section>
  );
}
