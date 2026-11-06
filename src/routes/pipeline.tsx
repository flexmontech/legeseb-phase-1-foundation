import { createFileRoute, Link } from "@tanstack/react-router";
import { update, useAppState, useActiveIndustry } from "@/lib/legeseb/store";
import { filterByIndustry, moveProspect } from "@/lib/legeseb/model";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Pipeline — LEGESEB" },
      { name: "description", content: "Move prospects through the LEGESEB pipeline stages." },
      { property: "og:title", content: "Pipeline — LEGESEB" },
      { property: "og:description", content: "Move prospects through the LEGESEB pipeline stages." },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const s = useAppState();
  const ind = useActiveIndustry();
  const list = filterByIndustry(s.prospects, s.activeIndustryId);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Pipeline</h1>
      <div className="grid gap-4 md:grid-cols-5">
        {s.stages.map((st) => {
          const items = list.filter((p) => p.stageId === st.id);
          return (
            <section key={st.id} className="rounded-xl border border-border bg-muted/60 p-3">
              <h2 className="mb-3 flex justify-between text-sm font-medium">
                {st.name} <span className="text-muted-foreground">{items.length}</span>
              </h2>
              {items.length === 0 && <p className="text-xs text-muted-foreground">No {(ind?.prospectPlural ?? "prospects").toLowerCase()} here.</p>}
              <ul className="space-y-2">
                {items.map((p) => (
                  <li key={p.id} className="rounded-lg border border-border bg-card p-3 text-sm shadow-sm">
                    <Link to="/prospects/$id" params={{ id: p.id }} className="font-medium text-primary hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{p.businessName && p.businessName !== p.name ? p.businessName : p.type}</div>
                    <select
                      aria-label={`Stage for ${p.name}`}
                      className="mt-2 h-8 w-full rounded border border-input bg-card px-1 text-xs"
                      value={p.stageId}
                      onChange={(e) => update((x) => moveProspect(x, p.id, e.target.value))}
                    >
                      {s.stages.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
