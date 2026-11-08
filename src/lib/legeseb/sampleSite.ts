import type { Industry, Prospect, Workspace } from "./model";

/** One reusable demonstration page per selected prospect. Fictional by design and labeled so. */
export interface SampleSite {
  id: string;
  prospectId: string;
  headline: string;
  intro: string;
  services: string[];
  cta: string;
  updatedAt: string;
}

export const SAMPLE_LABEL = "Demonstration page · Sample content for discussion only · Not the business's official website";
export const CREDIT = "Created by LEGESEB";

/** Builds starter content only from facts already on record; no reviews, results or endorsements. */
export function generateSampleSite(p: Prospect, industry: Industry | undefined, ws: Workspace, id: string, now = new Date().toISOString()): SampleSite {
  const business = p.businessName?.trim() || p.name;
  const where = p.location?.trim() ? ` in ${p.location.trim()}` : "";
  const kind = industry?.name ?? "local business";
  return {
    id,
    prospectId: p.id,
    headline: `${business}${where}`,
    intro: `A sample ${kind.toLowerCase()} homepage layout prepared by ${ws.name || "LEGESEB"} to show how ${business} could present its services online. Replace this text with details confirmed by the business.`,
    services: (industry?.services ?? ["Service one", "Service two"]).slice(0, 4),
    cta: p.phone || p.email ? "Contact us" : "Get in touch",
    updatedAt: now,
  };
}

/** Rejects content that implies proof the business never provided. */
export function fabricatedClaims(site: Pick<SampleSite, "headline" | "intro" | "services" | "cta">): string[] {
  const text = [site.headline, site.intro, site.cta, ...site.services].join(" ").toLowerCase();
  const banned = ["testimonial", "review", "rated", "award", "#1", "number one", "guarantee", "5-star", "five star", "trusted by"];
  return banned.filter((w) => text.includes(w));
}
