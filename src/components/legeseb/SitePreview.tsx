import { CREDIT, SAMPLE_LABEL, type SampleSite, type SiteTheme } from "@/lib/legeseb/sampleSite";

const LOOK: Record<SiteTheme, { hero: string; card: string; button: string }> = {
  corporate: { hero: "bg-primary text-primary-foreground", card: "border-border", button: "bg-card text-foreground" },
  wellness: { hero: "bg-theme-wellness text-theme-wellness-foreground", card: "border-theme-wellness/30 bg-theme-wellness/5", button: "bg-card text-foreground" },
  contractor: { hero: "bg-theme-contractor text-theme-contractor-foreground", card: "border-theme-contractor-accent/40", button: "bg-theme-contractor-accent text-theme-contractor" },
};

/** Shared renderer for every demonstration page; always shows the sample label and credit. */
export function SitePreview({ site }: { site: Pick<SampleSite, "headline" | "intro" | "services" | "cta" | "theme"> }) {
  const l = LOOK[site.theme ?? "corporate"];
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div role="note" className="bg-secondary px-4 py-2 text-center text-xs font-medium text-secondary-foreground">{SAMPLE_LABEL}</div>
      <header className={`${l.hero} px-6 py-14 text-center md:py-20`}>
        <h2 className="text-3xl font-semibold md:text-4xl">{site.headline}</h2>
        <p className="mx-auto mt-4 max-w-2xl opacity-90">{site.intro}</p>
        <span className={`mt-8 inline-block rounded-md px-5 py-2.5 text-sm font-medium ${l.button}`}>{site.cta}</span>
      </header>
      <section className="grid gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {site.services.map((sv) => (
          <div key={sv} className={`rounded-lg border p-5 ${l.card}`}><h3 className="font-medium">{sv}</h3></div>
        ))}
      </section>
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">{CREDIT}</footer>
    </div>
  );
}
