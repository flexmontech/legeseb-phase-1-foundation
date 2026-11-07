import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Target, KanbanSquare, PenLine, ArrowRight } from "lucide-react";
import hero from "@/assets/hero-chicago.jpg";
import b2b from "@/assets/aud-b2b.jpg";
import b2c from "@/assets/aud-b2c.jpg";
import industries from "@/assets/industries.jpg";
import { useAppState } from "@/lib/legeseb/store";
import { INDUSTRY_CATALOG } from "@/lib/legeseb/industryCatalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LEGESEB — Find and win customers in any industry" },
      { name: "description", content: "LEGESEB helps businesses find, qualify and win prospects across every industry, from Chicago outward." },
      { property: "og:title", content: "LEGESEB — Find and win customers in any industry" },
      { property: "og:description", content: "One lead-generation template for every industry: search, qualify, draft outreach, and track your pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Target, title: "Pick your audience", text: "Choose B2B or B2C and the industry you want to reach.", to: "/audiences" },
  { icon: Search, title: "Search industries", text: "Browse 165+ industries and turn any into a target.", to: "/industries" },
  { icon: PenLine, title: "Find & qualify", text: "Add or import prospects and see transparent match scores.", to: "/discovery" },
  { icon: KanbanSquare, title: "Work the pipeline", text: "Move prospects from Discovered to Won.", to: "/pipeline" },
] as const;

function Home() {
  const s = useAppState();
  const won = s.prospects.filter((p) => p.stageId === s.stages.at(-1)?.id).length;
  return (
    <div className="bg-muted">
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Chicago skyline at golden hour" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/10" />
        <div className="mx-auto max-w-7xl px-6 py-24 text-foreground md:py-36">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] opacity-80">Lead generation · Every industry</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Find the customers your business was built for.
          </h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">
            One template, any industry. Search markets, qualify prospects honestly, draft outreach, and track every deal to the win.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/industries" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
              Explore industries <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pipeline" className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-3 font-medium text-primary hover:bg-secondary">
              Open the pipeline
            </Link>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6">
            <Fact n={INDUSTRY_CATALOG.length} l="Industries" />
            <Fact n={s.prospects.length} l="Prospects" />
            <Fact n={won} l="Won" />
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text, to }, i) => (
            <Link key={to} to={to} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
                <span className="text-xs text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-3">
        <Tile img={b2b} title="Business clients" text="Offices, agencies, IT and trade buyers." to="/audiences" />
        <Tile img={b2c} title="Consumer audiences" text="Patients, guests and homeowners — consent-based only." to="/audiences" />
        <Tile img={industries} title="Every local trade" text="From nail salons to HVAC to AI services." to="/industries" />
      </section>
    </div>
  );
}

function Fact({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider opacity-70">{l}</dt>
      <dd className="text-3xl font-semibold">{n}</dd>
    </div>
  );
}

function Tile({ img, title, text, to }: { img: string; title: string; text: string; to: "/audiences" | "/industries" }) {
  return (
    <Link to={to} className="group relative block h-80 overflow-hidden rounded-2xl">
      <img src={img} alt={title} loading="lazy" width={1200} height={800} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 p-6 text-primary-foreground">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm opacity-85">{text}</p>
      </div>
    </Link>
  );
}
