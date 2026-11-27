import { uid, type Prospect, type Workspace } from "./model";
import type { Campaign, Channel } from "./phase2";

/**
 * Reusable outreach samples.
 *
 * Every sample is a token template: it can only say what the user actually
 * configured (client identity, real services, objective, call to action) plus
 * what is recorded on the prospect. Nothing here invents results,
 * testimonials, prices, deadlines or personal details.
 */

export interface OutreachTemplate {
  id: string;
  channel: Channel;
  name: string;
  purpose: string;
  subject: string;
  body: string;
}

export interface TemplateContext {
  name: string;
  business: string;
  identity: string;
  offering: string;
  industry: string;
  objective: string;
  cta: string;
  email: string;
  phone: string;
}

const LABELS: Record<keyof TemplateContext, string> = {
  name: "contact name",
  business: "business name",
  identity: "your business name",
  offering: "your actual service",
  industry: "industry",
  objective: "your objective",
  cta: "your call to action",
  email: "your email",
  phone: "your phone",
};

/** Optional contact details: left blank when unknown instead of prompting. */
const OPTIONAL = new Set<keyof TemplateContext>(["email", "phone"]);

export function templateContext(
  prospect: Prospect,
  campaign: Campaign,
  workspace: Workspace,
  industryName: string,
): TemplateContext {
  return {
    name: prospect.name.trim(),
    business: (prospect.businessName ?? "").trim(),
    identity: workspace.name.trim(),
    offering: campaign.offering.trim(),
    industry: industryName.trim(),
    objective: campaign.objective.trim(),
    cta: campaign.cta.trim(),
    email: workspace.contactEmail.trim(),
    phone: (workspace as Workspace & { phone?: string }).phone?.trim() ?? "",
  };
}

/** Replaces {tokens}; a missing required value becomes a [fill this in] marker. */
export function renderTemplate(template: OutreachTemplate, ctx: TemplateContext) {
  const fill = (text: string) => {
    const filled = text.replace(/\{(\w+)\}/g, (_all, key: string) => {
      const k = key as keyof TemplateContext;
      if (!(k in ctx)) return `{${key}}`;
      const value = ctx[k];
      if (value) return value;
      return OPTIONAL.has(k) ? "" : `[${LABELS[k]}]`;
    });
    // Drop lines an optional token left empty, and collapse extra blank lines.
    return filled
      .split("\n")
      .filter(line => line.trim() !== "")
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };
  return { subject: fill(template.subject), body: fill(template.body) };
}

/** Tokens a sample still needs before it is complete. */
export function missingFields(template: OutreachTemplate, ctx: TemplateContext) {
  const used = new Set<string>();
  for (const text of [template.subject, template.body]) {
    for (const m of text.matchAll(/\{(\w+)\}/g)) { const key = m[1]; if (key) used.add(key); }
  }
  return [...used].filter(k => !OPTIONAL.has(k as keyof TemplateContext) && !(ctx[k as keyof TemplateContext] ?? "").trim());
}

export const TEMPLATES: OutreachTemplate[] = [
  // ---------- Email ----------
  {
    id: "email-intro",
    channel: "email",
    name: "First contact — introduction",
    purpose: "Introduce your business and open a conversation.",
    subject: "{offering} for {business}",
    body: `Hi {name},

I'm reaching out from {identity}. We work with {industry} businesses and offer {offering}.

{objective}

{cta}

{identity}
{email}`,
  },
  {
    id: "email-service-fit",
    channel: "email",
    name: "First contact — service fit",
    purpose: "Lead with the specific service the prospect is interested in.",
    subject: "{offering} — is this relevant right now?",
    body: `Hi {name},

I'm writing from {identity}. Based on what we have recorded for {business}, {offering} looks like the most relevant starting point for you.

Our aim here is simple: {objective}.

If that is worth a short conversation, {cta}

If the timing is wrong, just reply and let me know — I will leave it there.

{identity}
{email}`,
  },
  {
    id: "email-follow-up",
    channel: "email",
    name: "Follow-up — one polite nudge",
    purpose: "A single reminder after an earlier message with no reply.",
    subject: "Following up on {offering}",
    body: `Hi {name},

I sent a note recently about {offering} and wanted to follow up once, in case it got buried.

{objective}

{cta}

If this isn't a fit, no reply is needed and I won't follow up again.

{identity}
{email}`,
  },
  {
    id: "email-reengagement",
    channel: "email",
    name: "Re-engagement — checking in",
    purpose: "Reopen a conversation with a prospect that went quiet.",
    subject: "Still worth a conversation, {name}?",
    body: `Hi {name},

We spoke a while back about {offering}. I'm checking in once to see whether anything has changed on your side.

If it is still relevant, {cta}

If it isn't, tell me and I'll close this off so you're not hearing from us unnecessarily.

{identity}
{email}`,
  },
  {
    id: "email-closing",
    channel: "email",
    name: "Closing the file",
    purpose: "Ask permission to stop, and keep the record honest.",
    subject: "Closing your file — {offering}",
    body: `Hi {name},

I haven't heard back, so I'm assuming {offering} isn't a priority right now and I'll stop reaching out.

If that's wrong and you'd like to pick it up later, {cta}

Thanks for your time either way.

{identity}
{email}`,
  },
  // ---------- SMS ----------
  {
    id: "sms-intro",
    channel: "sms",
    name: "SMS — first contact",
    purpose: "Short introduction with one clear next step.",
    subject: "",
    body: `Hi {name}, this is {identity}. We offer {offering} for {business}. {objective} {cta} Reply STOP to opt out.`,
  },
  {
    id: "sms-follow-up",
    channel: "sms",
    name: "SMS — follow-up",
    purpose: "One short reminder after no reply.",
    subject: "",
    body: `Hi {name}, following up on {offering} from {identity}. Still worth a quick chat? {cta} Reply STOP to opt out.`,
  },
  // ---------- Call ----------
  {
    id: "call-intro",
    channel: "call",
    name: "Call script — first contact",
    purpose: "Opening, purpose, one question, next step, polite exit.",
    subject: "",
    body: `Opening: Hello {name}, this is {identity} calling about {business}. Is now a suitable time for a short conversation?

Purpose: We offer {offering}. {objective}

Question: Is {offering} relevant to what you need at the moment?

Next step: {cta}

If not interested: Thank you for your time. I'll note that and won't call again.`,
  },
  {
    id: "call-follow-up",
    channel: "call",
    name: "Call script — follow-up",
    purpose: "Second call after an earlier unanswered contact.",
    subject: "",
    body: `Opening: Hello {name}, {identity} here — I reached out recently about {offering} and wanted to try once more.

Purpose: {objective}

Question: Has anything changed that makes this relevant now?

Next step: {cta}

If not interested: Understood — thank you for your time, I'll close this off.`,
  },
];

export function templatesForChannel(channel: Channel) {
  return TEMPLATES.filter(t => t.channel === channel);
}

/** Copy a sample into the draft store so it survives a page reload. */
export function draftFromTemplate(
  template: OutreachTemplate,
  ctx: TemplateContext,
  prospectId: string,
  campaignId: string,
  channel: Channel,
) {
  const rendered = renderTemplate(template, ctx);
  return {
    id: uid(),
    prospectId,
    campaignId,
    channel,
    subject: rendered.subject,
    body: rendered.body,
    updatedAt: new Date().toISOString(),
  };
}
