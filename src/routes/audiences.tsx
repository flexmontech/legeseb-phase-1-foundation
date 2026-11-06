import { createFileRoute, Link } from "@tanstack/react-router";
import b2b from "@/assets/aud-b2b.jpg";
import b2c from "@/assets/aud-b2c.jpg";
import { useAppState, update } from "@/lib/legeseb/store";
import { setActiveIndustry } from "@/lib/legeseb/model";

export const Route = createFileRoute("/audiences")({
  head: () => ({
    meta: [
      { title: "Clients & Audiences — LEGESEB" },
      { name: "description", content: "Your client workspace and the B2B and B2C audiences LEGESEB helps you reach." },
      { property: "og:title", content: "Clients & Audiences — LEGESEB" },
      { property: "og:description", content: "See who you serve and who you target, by industry and audience type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Audiences,
});

function Audiences() {
  const s = useAppState();
  const groups = (["B2B", "B2C"] as const).map((t) => ({
    t,
    inds: s.industries
      .filter((i) => i.targetType === t)
      .map((i) => ({ i, n: s.prospects.filter((p) => p.industryId === i.id).length })),
  }));

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Client</p>
        <h1 className="mt-1 text-3xl font-semibold">{s.workspace.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{s.workspace.description || "Add a description in Settings."}</p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link to="/settings" className="rounded-full border border-border px-4 py-2 hover:bg-muted">Edit client profile</Link>
          <Link to="/prospects" className="rounded-full bg-primary px-4 py-2 text-primary-foreground">View {s.prospects.length} prospects</Link>
        </div>
      </section>

      {groups.map(({ t, inds }) => (
        <section key={t} className="grid gap-6 md:grid-cols-[22rem_1fr]">
          <div className="relative h-56 overflow-hidden rounded-2xl md:h-auto">
            <img src={t === "B2B" ? b2b : b2c} alt="" loading="lazy" width={1200} height={800} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sidebar/90 to-transparent" />
            <div className="absolute bottom-0 p-5 text-sidebar-foreground">
              <h2 className="text-2xl font-semibold">{t === "B2B" ? "Business audiences" : "Consumer audiences"}</h2>
              <p className="text-sm opacity-85">{t === "B2B" ? "Companies buying services" : "Individuals — authorized, consent-based sources only"}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inds.map(({ i, n }) => (
              <div key={i.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{i.name}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{n}</span>
                </div>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{i.services.join(" · ") || "No services yet"}</p>
                <Link
                  to="/prospects"
                  onClick={() => update((st) => setActiveIndustry(st, i.id))}
                  className="mt-3 text-sm font-medium text-accent hover:underline"
                >
                  View {i.prospectPlural.toLowerCase()} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
