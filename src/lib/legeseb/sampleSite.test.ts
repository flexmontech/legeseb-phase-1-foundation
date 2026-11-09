import { describe, expect, it } from "vitest";
import { fabricatedClaims, generateSampleSite } from "./sampleSite";
import { PRESETS, type Prospect } from "./model";
import { createBlankState } from "./workspaces";

const p: Prospect = { id: "p1", workspaceId: "w", name: "Ana", businessName: "Loop Dental", industryId: "dental", type: "B2C", source: "Other", stageId: "discovered", notes: "", location: "Chicago, IL", createdAt: "", updatedAt: "" };

describe("sample websites", () => {
  it("builds content only from recorded facts, with no fabricated claims", () => {
    const site = generateSampleSite(p, PRESETS.find((i) => i.id === "dental"), { id: "w", name: "Acme", description: "", contactEmail: "" }, "s1");
    expect(site.headline).toBe("Loop Dental in Chicago, IL");
    expect(site.services).toEqual(["Check-up & cleaning", "Whitening", "Orthodontics"]);
    expect(fabricatedClaims(site)).toEqual([]);
  });
  it("flags testimonials and awards", () => {
    expect(fabricatedClaims({ headline: "Award winning", intro: "Read our testimonials", services: [], cta: "" })).toEqual(["testimonial", "award"]);
  });
});

describe("live workspaces", () => {
  it("start with no prospects or demo data", () => {
    const s = createBlankState("w1", "Client A");
    expect(s.prospects).toHaveLength(0);
    expect(s.workspace.name).toBe("Client A");
  });
});
