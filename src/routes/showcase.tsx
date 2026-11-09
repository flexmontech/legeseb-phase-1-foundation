import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SitePreview } from "@/components/legeseb/SitePreview";
import { THEMES, type SiteTheme } from "@/lib/legeseb/sampleSite";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Sample Website Showcase — LEGESEB" },
      { name: "description", content: "See the three demonstration website styles LEGESEB prepares for local businesses." },
      { property: "og:title", content: "Sample Website Showcase — LEGESEB" },
      { property: "og:description", content: "Executive, calm and bold demonstration website styles, clearly labeled and honest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Showcase,
});

// Fictional example businesses only; no real contacts, reviews or results.
const EXAMPLES: Record<SiteTheme, { headline: string; intro: string; services: string[]; cta: string }> = {
  corporate: { headline: "Example Advisory Group", intro: "A fictional professional-services firm used to show the Executive style. Real pages use only details the business confirms.", services: ["Consulting", "Bookkeeping", "IT support", "Planning"], cta: "Book a call" },
  wellness: { headline: "Example Wellness Studio", intro: "A fictional spa and clinic used to show the Calm style. Real pages use only details the business confirms.", services: ["Massage", "Facials", "Dental cleaning", "Consultations"], cta: "Make an appointment" },
  contractor: { headline: "Example Home Services", intro: "A fictional trades company used to show the Bold style. Real pages use only details the business confirms.", services: ["Heating & cooling", "Roofing", "Landscaping", "Repairs"], cta: "Request a quote" },
};

function Showcase() {
  const [theme, setTheme] = useState<SiteTheme>("corporate");
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Sample website showcase</h1>
        <p className="mt-2 text-muted-foreground">LEGESEB can prepare a demonstration homepage for a business, in a style that fits its industry. Every sample is labeled, credited, and free of invented reviews or results.</p>
      </div>
      <div role="tablist" aria-label="Website style" className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <button key={t.id} role="tab" aria-selected={theme === t.id} onClick={() => setTheme(t.id)}
            className={`rounded-full border px-4 py-1.5 text-sm ${theme === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <SitePreview site={{ ...EXAMPLES[theme], theme }} />
      <p className="text-sm text-muted-foreground">Want one for your business? <Link to="/audiences" className="text-accent underline">See who we work with</Link>.</p>
    </div>
  );
}
