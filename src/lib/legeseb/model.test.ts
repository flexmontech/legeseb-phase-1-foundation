import { describe, expect, it } from "vitest";
import { addIndustry, createSeedState, filterByIndustry, moveProspect, setActiveIndustry, stageCounts } from "./model";

describe("LEGESEB model", () => {
  it("seeds the 26 audited Chicago leads, all in Discovered, with no fictional records", () => {
    const s = createSeedState();
    expect(s.prospects).toHaveLength(26);
    expect(s.prospects.every((p) => p.stageId === "discovered" && !p.demo)).toBe(true);
    expect(s.prospects.every((p) => s.industries.some((i) => i.id === p.industryId))).toBe(true);
  });
  it("uses five pipeline stages", () => {
    expect(createSeedState().stages.map((s) => s.name)).toEqual(["Discovered", "Active Ready", "Pitched", "Viewed", "Won"]);
  });
  it("switching industry does not change saved prospects", () => {
    const s = createSeedState();
    const next = setActiveIndustry(s, "dental");
    expect(next.prospects).toBe(s.prospects);
    expect(filterByIndustry(next.prospects, "dental")).toHaveLength(2);
  });
  it("stage counts add up to the prospect total", () => {
    const s = createSeedState();
    expect(stageCounts(s.prospects, s.stages).reduce((a, c) => a + c.count, 0)).toBe(26);
  });
  it("adds a custom industry", () => {
    const s = addIndustry(createSeedState(), { name: "Pet grooming", services: ["Bath"], prospectSingular: "Owner", prospectPlural: "Owners", targetType: "B2C" });
    expect(s.industries.at(-1)).toMatchObject({ id: "pet-grooming", custom: true });
  });
  it("moves a prospect to another stage", () => {
    const s = createSeedState();
    const id = s.prospects[0]!.id;
    expect(moveProspect(s, id, "won").prospects[0]!.stageId).toBe("won");
  });
});
