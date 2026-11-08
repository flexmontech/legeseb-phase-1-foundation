import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "@/lib/legeseb/store";
import { CREDIT, SAMPLE_LABEL } from "@/lib/legeseb/sampleSite";

export const Route = createFileRoute("/sample/$id")({
  head: () => ({
    meta: [
      { title: "Sample website preview — LEGESEB" },
      { name: "description", content: "Demonstration website preview created by LEGESEB." },
      { property: "og:title", content: "Sample website preview — LEGESEB" },
      { property: "og:description", content: "Demonstration website preview created by LEGESEB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  const s = useAppState();
  const site = s.sites?.find((x) => x.id === id);
  const p = site && s.prospects.find((x) => x.id === site.prospectId);
  if (!site) return <p className="text-sm">Sample website not found. <Link to="/prospects" className="underline">Back to prospects</Link></p>;
  return (
    <div className="space-y-4">
      {p && <Link to="/prospects/$id" params={{ id: p.id }} className="text-sm text-accent underline">← Back to {p.businessName || p.name}</Link>}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div role="note" className="bg-secondary px-4 py-2 text-center text-xs font-medium text-secondary-foreground">{SAMPLE_LABEL}</div>
        <header className="bg-primary px-6 py-16 text-center text-primary-foreground md:py-24">
          <h1 className="text-3xl font-semibold md:text-5xl">{site.headline}</h1>
          <p className="mx-auto mt-4 max-w-2xl opacity-90">{site.intro}</p>
          <span className="mt-8 inline-block rounded-md bg-card px-5 py-2.5 text-sm font-medium text-foreground">{site.cta}</span>
        </header>
        <section className="grid gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {site.services.map((sv) => (
            <div key={sv} className="rounded-lg border border-border p-5"><h2 className="font-medium">{sv}</h2></div>
          ))}
        </section>
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">{CREDIT}</footer>
      </div>
    </div>
  );
}
