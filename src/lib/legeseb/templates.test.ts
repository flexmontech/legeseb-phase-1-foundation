import { describe, expect, it } from "vitest";
import { type Prospect, type Workspace } from "./model";
import { defaultCriteria, type Campaign } from "./phase2";
import { TEMPLATES, draftFromTemplate, missingFields, renderTemplate, templateContext, templatesForChannel } from "./templates";

const workspace: Workspace = { id: "w", name: "Chicago Pilot Workspace", description: "", contactEmail: "hello@flexmon.tech" };
const campaign: Campaign = {
  id: "c1", name: "Dental outreach", offering: "hygiene plan renewals", industryId: "dental", type: "B2C",
  location: "Chicago", objective: "we are asking practices to review their renewal list", cta: "Would you like a 10-minute call this week?",
  webReadiness: false, criteria: defaultCriteria("dental", "B2C"),
};
const prospect: Prospect = {
  id: "p1", workspaceId: "w", name: "Alex Rivera", businessName: "Lakeshore Dental", industryId: "dental", type: "B2C",
  email: "alex@example.com", source: "Other", stageId: "discovered", notes: "", createdAt: "", updatedAt: "",
};
const ctx = templateContext(prospect, campaign, workspace, "Dental");

describe("outreach sample templates", () => {
  it("covers every channel with reusable samples", () => {
    expect(templatesForChannel("email").length).toBeGreaterThanOrEqual(4);
    expect(templatesForChannel("sms").length).toBeGreaterThanOrEqual(1);
    expect(templatesForChannel("call").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a complete context with no leftover tokens or fill-in markers", () => {
    for (const t of TEMPLATES) {
      const r = renderTemplate(t, ctx);
      expect(r.body).not.toMatch(/\{\w+\}/);
      expect(r.body).not.toContain("[");
      expect(r.subject).not.toMatch(/\{\w+\}/);
    }
  });

  it("only states supplied facts: offering, objective and call to action appear", () => {
    const r = renderTemplate(TEMPLATES.find(t => t.id === "email-intro")!, ctx);
    expect(r.body).toContain("Chicago Pilot Workspace");
    expect(r.body).toContain("hygiene plan renewals");
    expect(r.body).toContain("Would you like a 10-minute call this week?");
    expect(r.body).toContain("Alex Rivera");
    expect(r.subject).toBe("hygiene plan renewals for Lakeshore Dental");
  });

  it("marks missing facts instead of inventing them", () => {
    const thin = templateContext({ ...prospect, businessName: undefined }, { ...campaign, offering: "" }, { ...workspace, contactEmail: "" }, "");
    const r = renderTemplate(TEMPLATES.find(t => t.id === "email-intro")!, thin);
    expect(r.body).toContain("[industry]");
    expect(r.body).toContain("[your actual service]");
    expect(r.subject).toContain("[business name]");
    expect(missingFields(TEMPLATES.find(t => t.id === "email-intro")!, thin)).toContain("offering");
    expect(missingFields(TEMPLATES.find(t => t.id === "email-intro")!, ctx)).toEqual([]);
  });

  it("keeps samples free of fabricated claims, results and urgency devices", () => {
    const banned = /%|testimonial|guarantee|guaranteed|deadline|limited spots|free trial|save \$|\$\d/i;
    for (const t of TEMPLATES) {
      const r = renderTemplate(t, ctx);
      expect(`${r.subject} ${r.body}`).not.toMatch(banned);
    }
  });

  it("keeps SMS opt-out language on text samples", () => {
    for (const t of templatesForChannel("sms")) {
      expect(renderTemplate(t, ctx).body).toContain("Reply STOP to opt out.");
    }
  });

  it("saves a loaded sample as a draft linked to prospect and campaign", () => {
    const draft = draftFromTemplate(TEMPLATES.find(t => t.id === "sms-follow-up")!, ctx, "p1", "c1", "sms");
    expect(draft).toMatchObject({ prospectId: "p1", campaignId: "c1", channel: "sms" });
    expect(draft.body).toContain("hygiene plan renewals");
    expect(draft.id).toBeTruthy();
  });
});
