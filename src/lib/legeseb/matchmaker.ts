import { z } from "zod";
import { INDUSTRY_CATALOG } from "./industryCatalog";
import { THEMES, type SiteTheme } from "./sampleSite";

export const MatchInput = z.object({
  business: z.string().trim().min(3, "Tell us a little about your business").max(600),
  customers: z.string().trim().max(400).default(""),
  goal: z.string().trim().max(400).default(""),
});
export type MatchInput = z.infer<typeof MatchInput>;

export interface MatchResult {
  industry: string;
  audience: "B2B" | "B2C" | "Both";
  audienceReason: string;
  services: string[];
  theme: SiteTheme;
  themeReason: string;
  firstSteps: string[];
  summary: string;
}

/** Keeps the model's answer inside what the app actually offers. */
export function cleanMatch(raw: unknown): MatchResult | null {
  const r = z
    .object({
      industry: z.string(),
      audience: z.enum(["B2B", "B2C", "Both"]),
      audienceReason: z.string(),
      services: z.array(z.string()),
      theme: z.string(),
      themeReason: z.string(),
      firstSteps: z.array(z.string()),
      summary: z.string(),
    })
    .safeParse(raw);
  if (!r.success) return null;
  const v = r.data;
  const hit = INDUSTRY_CATALOG.find((c) => c.name.toLowerCase() === v.industry.trim().toLowerCase());
  const theme = (THEMES.find((t) => t.id === v.theme)?.id ?? "corporate") as SiteTheme;
  return {
    ...v,
    industry: hit?.name ?? v.industry.trim(),
    theme,
    services: v.services.slice(0, 5),
    firstSteps: v.firstSteps.slice(0, 4),
  };
}
