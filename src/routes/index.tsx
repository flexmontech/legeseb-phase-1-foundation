import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState, useActiveIndustry } from "@/lib/legeseb/store";
import { filterByIndustry, stageCounts } from "@/lib/legeseb/model";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — LEGESEB" },
      { name: "description", content: "LEGESEB prospect counts and pipeline summary." },
      { property: "og:title", content: "Dashboard — LEGESEB" },
      { property: "og:description", content: "LEGESEB prospect counts and pipeline summary." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useAppState();
  const ind = useActiveIndustry();
  const list = filterByIndustry(s.prospects, s.activeIndustryId);
  const counts = stageCounts(list, s.stages);
  const max = Math.max(1, ...counts.map((c) => c.count));
  const plural = ind?.prospectPlural ?? "Prospects";
  const b2b = list.filter((p) => p.type === "B2B").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{ind ? ind.name : "All industries"}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label={`Total ${plural.toLowerCase()}`} value={list.length} />
        <Stat label="B2B" value={b2b} />
        <Stat label="B2C" value={list.length - b2b} />
        <Stat label={s.stages.at(-1)?.name ?? "Final stage"} value={counts.at(-1)?.count ?? 0} />
      </div>
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-medium">Pipeline summary</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {plural.toLowerCase()} yet. <Link to="/prospects" className="text-accent underline">Add one</Link>.
          </p>
        ) : (
          <ul className="space-y-3">
            {counts.map(({ stage, count }) => (
              <li key={stage.id} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-sm">
                <span>{stage.name}</span>
                <div className="h-3 rounded bg-muted">
                  <div className="h-3 rounded bg-primary" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="text-right font-medium">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
