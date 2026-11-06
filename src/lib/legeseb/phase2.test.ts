import { describe, expect, it } from "vitest";
import { createSeedState, type Prospect } from "./model";
import { defaultCriteria, generateDraft, normalizeState, parseCSV, prepareImport, provenance, qualify, type Campaign } from "./phase2";

const state = createSeedState();
const prospect: Prospect = { id: "fixture", workspaceId: "w", name: "Demo Guest 1", industryId: "spa", type: "B2C", email: "demo1@example.com", source: "Referral", service: "Massage", stageId: "discovered", recordSource: "Demo", notes: "", demo: true, createdAt: "", updatedAt: "" };
const campaign: Campaign = { id: "campaign", name: "Spa outreach", offering: "Massage", industryId: "spa", type: "B2C", location: "", objective: "booking a consultation", cta: "Would you like to arrange a consultation?", webReadiness: false, criteria: defaultCriteria("spa", "B2C") };
describe("Phase 2", () => {
  it("preserves Phase 1 records and stages while adding empty collections", () => {
    const next = normalizeState(state);
    expect(next.prospects.map(p => p.id)).toEqual(state.prospects.map(p => p.id));
    expect(next.stages).toEqual(state.stages);
    expect(next.campaigns).toEqual([]); expect(next.drafts).toEqual([]);
  });
  it("labels demo, legacy manual and imported records honestly", () => {
    expect(provenance(prospect)).toBe("Demo");
    expect(provenance({ ...prospect, demo: false, recordSource: undefined })).toBe("Manual");
    expect(provenance({ ...prospect, demo: false, recordSource: "Imported" })).toBe("Imported");
  });
  it("parses quoted commas and multiline CSV values", () => {
    const csv = parseCSV('Name,Notes\r\n"Alex, Smith","Line one\nLine two"');
    expect(csv.errors).toEqual([]); expect(csv.rows[0]).toEqual({ Name: "Alex, Smith", Notes: "Line one\nLine two" });
  });
  it("blocks B2C import without source authorization", () => {
    expect(prepareImport([{ Name: "Alex" }], { name: "Name" }, campaign, state, false, "Client list").prospects).toHaveLength(0);
  });
  it("blocks B2C import without source details", () => {
    expect(prepareImport([{ Name: "Alex" }], { name: "Name" }, campaign, state, true, "").prospects).toHaveLength(0);
  });
  it("imports mapped authorized contacts with Imported provenance and campaign context", () => {
    const result = prepareImport([{ Contact: "Alex", City: "London" }], { name: "Contact", location: "City" }, campaign, state, true, "Client opt-in list");
    expect(result.prospects[0]).toMatchObject({ name: "Alex", location: "London", recordSource: "Imported", authorizedSource: true, sourceDetail: "Client opt-in list", campaignId: "campaign", industryId: "spa", type: "B2C" });
  });
  it("skips duplicate emails and invalid rows", () => {
    const result = prepareImport([{ Name: "A", Email: "a@example.com" }, { Name: "B", Email: "A@example.com" }, { Name: "C", Email: "bad" }, { Name: "", Email: "" }], { name: "Name", email: "Email" }, campaign, state, true, "Authorized client list");
    expect(result.prospects).toHaveLength(1); expect(result.duplicates).toBe(1); expect(result.errors).toHaveLength(2);
  });
  it("excludes unknown evidence from assessed score and exposes coverage", () => {
    const result = qualify({ ...prospect, email: "", phone: "" }, campaign);
    expect(result.score).toBe(100); expect(result.earned).toBe(60); expect(result.assessed).toBe(60); expect(result.total).toBe(80); expect(result.coverage).toBe(75);
    expect(result.factors.find(f => f.field === "phone")?.status).toBe("unknown");
  });
  it("honors campaign configured weights and shows zero for known mismatch", () => {
    const result = qualify(prospect, { ...campaign, criteria: [{ id: "location", field: "location", label: "Location", expected: "London", points: 25 }, { id: "email", field: "email", label: "Email", expected: "", points: 75 }] });
    const mismatch = qualify({ ...prospect, location: "Paris" }, { ...campaign, criteria: [{ id: "location", field: "location", label: "Location", expected: "London", points: 25 }] });
    expect(result.score).toBe(100); expect(result.coverage).toBe(75); expect(mismatch.score).toBe(0); expect(mismatch.factors[0]?.earned).toBe(0);
  });
  it("returns unknown for entirely missing factors", () => {
    expect(qualify({ ...prospect, website: "" }, { ...campaign, webReadiness: true, criteria: [{ id: "web", field: "website", label: "Website", expected: "", points: 10 }] }).score).toBe(null);
  });
  it("checks only supplied URL format and scheme when enabled", () => {
    const web: Campaign = { ...campaign, webReadiness: true, criteria: [{ id: "url", field: "website", label: "URL", expected: "", points: 10 }, { id: "scheme", field: "https", label: "HTTPS", expected: "", points: 10 }] };
    expect(qualify({ ...prospect, website: "http://example.com" }, web).score).toBe(50);
    expect(qualify({ ...prospect, website: "https://example.com" }, web).score).toBe(100);
    expect(qualify({ ...prospect, website: "javascript:alert(1)" }, web).score).toBe(0);
    expect(qualify(prospect, { ...web, webReadiness: false }).factors).toHaveLength(0);
  });
  it("creates all three drafts from actual supplied identity, offering, objective and CTA", () => {
    for (const channel of ["email", "sms", "call"] as const) {
      const draft = generateDraft({ ...prospect, name: "Alex" }, campaign, { ...state.workspace, name: "Actual Spa" }, "Spa and wellness", channel);
      expect(draft.body).toContain("Alex"); expect(draft.body).toContain("Actual Spa"); expect(draft.body).toContain("Massage"); expect(draft.body).toContain(campaign.objective); expect(draft.body).toContain(campaign.cta);
      expect(draft.body).not.toMatch(/testimonial|guaranteed|audited|visited your/i);
    }
  });
  it("does not fabricate a missing offering", () => {
    expect(generateDraft(prospect, { ...campaign, offering: "" }, state.workspace, "Spa", "email").body).toBe("");
  });
});