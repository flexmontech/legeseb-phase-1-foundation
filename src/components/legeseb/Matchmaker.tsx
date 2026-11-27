import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { recommendMatch } from "@/lib/legeseb/matchmaker.functions";
import { THEMES } from "@/lib/legeseb/sampleSite";

const EXAMPLES = [
  { business: "Family dental practice in Lincoln Park offering cleanings, whitening and implants", customers: "Local families and young professionals", goal: "Fill more new-patient appointments" },
  { business: "Commercial HVAC installation and maintenance company", customers: "Office buildings and property managers", goal: "Win maintenance contracts" },
  { business: "Small IT and AI automation consultancy", customers: "Small businesses with 10-50 staff", goal: "Book discovery calls" },
];

export function Matchmaker() {
  const [form, setForm] = useState({ business: "", customers: "", goal: "" });
  const run = useServerFn(recommendMatch);
  const m = useMutation({ mutationFn: (d: typeof form) => run({ data: d }) });
  const res = m.data?.result;
  const field = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground";

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Sparkles className="h-4 w-4" /> Business matchmaker</p>
          <h2 className="mt-3 text-3xl font-semibold">Tell us about your business</h2>
          <p className="mt-2 text-sm text-muted-foreground">Describe what you do and who you serve. We'll recommend your audience, industry and a sample website style.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e.business} type="button" onClick={() => setForm(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary">
                {e.business.split(" ").slice(0, 3).join(" ")}…
              </button>
            ))}
          </div>
          <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate(form); }}>
            <label className="block text-sm font-medium">What does your business do?
              <textarea required minLength={3} maxLength={600} rows={3} className={field} value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">Who are your customers?
              <input maxLength={400} className={field} value={form.customers} onChange={(e) => setForm({ ...form, customers: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">What's your main goal?
              <input maxLength={400} className={field} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </label>
            <button type="submit" disabled={m.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {m.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Matching…</> : <>Get my recommendation <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
        <div className="rounded-2xl bg-muted p-6" aria-live="polite">
          {m.isError || m.data?.error ? (
            <p className="text-sm text-destructive">{m.data?.error ?? "Something went wrong. Please try again."}</p>
          ) : res ? (
            <div className="space-y-5">
              <p className="text-sm">{res.summary}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Industry</dt><dd className="font-semibold">{res.industry}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Audience</dt><dd className="font-semibold">{res.audience}</dd><p className="text-xs text-muted-foreground">{res.audienceReason}</p></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Site style</dt><dd className="font-semibold">{THEMES.find((t) => t.id === res.theme)?.label}</dd><p className="text-xs text-muted-foreground">{res.themeReason}</p></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Services to feature</dt><dd className="text-sm">{res.services.join(", ")}</dd></div>
              </dl>
              <div>
                <h3 className="text-sm font-semibold">First steps</h3>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">{res.firstSteps.map((s) => <li key={s}>{s}</li>)}</ol>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/industries" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Explore this industry</Link>
                <Link to="/showcase" className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">See sample sites</Link>
                <Link to="/audiences" className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">Audiences</Link>
              </div>
              <p className="text-xs text-muted-foreground">AI suggestion only — review before acting.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Your recommendation will appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
}
