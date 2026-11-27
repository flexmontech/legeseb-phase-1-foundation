import { describe, expect, it } from "vitest";
import { cleanMatch } from "./matchmaker";

const base = { industry: "dentists", audience: "B2C", audienceReason: "r", services: ["a"], theme: "wellness", themeReason: "t", firstSteps: ["s"], summary: "x" };

describe("cleanMatch", () => {
  it("rejects malformed answers", () => expect(cleanMatch({ industry: 1 })).toBeNull());
  it("falls back to a real theme", () => expect(cleanMatch({ ...base, theme: "neon" })?.theme).toBe("corporate"));
  it("caps services at five", () => expect(cleanMatch({ ...base, services: ["1", "2", "3", "4", "5", "6"] })?.services).toHaveLength(5));
});
