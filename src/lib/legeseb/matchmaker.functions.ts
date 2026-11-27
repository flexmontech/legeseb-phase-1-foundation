import { createServerFn } from "@tanstack/react-start";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { INDUSTRY_CATALOG } from "./industryCatalog";
import { MatchInput, cleanMatch, type MatchResult } from "./matchmaker";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["industry", "audience", "audienceReason", "services", "theme", "themeReason", "firstSteps", "summary"],
  properties: {
    industry: { type: "string", description: "Exact name from the provided industry list" },
    audience: { type: "string", enum: ["B2B", "B2C", "Both"] },
    audienceReason: { type: "string" },
    services: { type: "array", items: { type: "string" }, description: "3-5 services the business described" },
    theme: { type: "string", enum: ["corporate", "wellness", "contractor"] },
    themeReason: { type: "string" },
    firstSteps: { type: "array", items: { type: "string" }, description: "3-4 practical first steps in the app" },
    summary: { type: "string", description: "Two sentences, plain language" },
  },
} as const;

export const recommendMatch = createServerFn({ method: "POST" })
  .inputValidator((d) => MatchInput.parse(d))
  .handler(async ({ data }): Promise<{ result: MatchResult | null; error?: string }> => {
    const list = INDUSTRY_CATALOG.map((c) => c.name).join("; ");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "You recommend how a business should use a lead-generation app. Pick the single best industry from the list, the audience type, services taken only from what the user described, and a sample-site style: corporate (professional services), wellness (clinics, spas, personal care) or contractor (trades). Never invent results, reviews, statistics or guarantees. For consumer audiences, remind them that contacts must come from consent-based or client-authorized sources.\n\nIndustry list: " +
          list,
        input: `Business: ${data.business}\nCustomers: ${data.customers || "not stated"}\nGoal: ${data.goal || "not stated"}`,
        text: { format: { type: "json_schema", name: "match", schema: SCHEMA, strict: true } },
      });
      let text = "";
      for (const item of res.output ?? []) {
        if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
      }
      const result = cleanMatch(JSON.parse(text));
      return result ? { result } : { result: null, error: "We couldn't read the recommendation. Please try again." };
    } catch (e) {
      console.error("matchmaker failed", e);
      if (e instanceof GatewayError && e.httpStatus === 429) return { result: null, error: "Too many requests right now. Please try again in a minute." };
      if (e instanceof GatewayError && e.httpStatus === 402) return { result: null, error: "The AI service is out of credits for now." };
      return { result: null, error: "The recommendation service is unavailable right now. Please try again." };
    }
  });
