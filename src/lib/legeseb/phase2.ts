import Papa from "papaparse";
import { uid, type Prospect, type TargetType, type Workspace, type AppState } from "./model";

export type FactorField = "industryId" | "type" | "location" | "service" | "email" | "phone" | "authorizedSource" | "website" | "https";
export interface Criterion { id: string; field: FactorField; label: string; expected: string; points: number }
export interface Campaign {
  id: string; name: string; offering: string; industryId: string; type: TargetType;
  location: string; objective: string; cta: string; webReadiness: boolean; criteria: Criterion[];
}
export interface OutreachDraft { id: string; prospectId: string; campaignId: string; channel: Channel; subject: string; body: string; updatedAt: string }
export type Channel = "email" | "sms" | "call";
export const FACTOR_FIELDS: { field: FactorField; label: string }[] = [
  { field: "industryId", label: "Industry match" }, { field: "type", label: "Target type match" },
  { field: "location", label: "Location match" }, { field: "service", label: "Service interest match" },
  { field: "email", label: "Email provided" }, { field: "phone", label: "Phone provided" },
  { field: "authorizedSource", label: "Authorized source confirmed" },
  { field: "website", label: "Website URL format" }, { field: "https", label: "HTTPS in supplied URL" },
];
export function defaultCriteria(industryId: string, type: TargetType, location = ""): Criterion[] {
  return [
    { id: uid(), field: "industryId", label: "Industry match", expected: industryId, points: 30 },
    { id: uid(), field: "type", label: "Target type match", expected: type, points: 30 },
    ...(location.trim() ? [{ id: uid(), field: "location" as const, label: "Location match", expected: location.trim(), points: 20 }] : []),
    { id: uid(), field: "email", label: "Email provided", expected: "", points: 10 },
    { id: uid(), field: "phone", label: "Phone provided", expected: "", points: 10 },
  ];
}
export function provenance(p: Prospect) { return p.demo ? "Demo" : p.recordSource ?? "Manual"; }
export function normalizeState(s: AppState): AppState {
  return { ...s, campaigns: s.campaigns ?? [], drafts: s.drafts ?? [], prospects: s.prospects.map(p => ({ ...p, recordSource: provenance(p) })) };
}
export function validWebsite(raw: string) {
  try { const url = new URL(raw); return ["http:", "https:"].includes(url.protocol) && url.hostname.includes("."); } catch { return false; }
}
export function qualify(p: Prospect, campaign: Campaign) {
  const factors = campaign.criteria.filter(c => campaign.webReadiness || (c.field !== "website" && c.field !== "https")).map(c => {
    let status: "unknown" | "match" | "no-match" = "unknown";
    let observed = "Unknown";
    if (c.field === "authorizedSource") {
      if (p.authorizedSource !== undefined) { status = p.authorizedSource ? "match" : "no-match"; observed = p.authorizedSource ? "Confirmed" : "Not confirmed"; }
    } else {
      const value = c.field === "https" ? p.website : p[c.field];
      if (typeof value === "string" && value.trim()) {
        observed = value;
        const match = c.field === "website" ? validWebsite(value)
          : c.field === "https" ? validWebsite(value) && value.toLowerCase().startsWith("https://")
          : c.field === "email" || c.field === "phone" ? true
          : c.expected.trim() ? value.trim().toLowerCase() === c.expected.trim().toLowerCase() : undefined;
        if (match !== undefined) status = match ? "match" : "no-match";
      }
    }
    const possible = Math.max(0, c.points);
    return { ...c, status, observed, possible, earned: status === "unknown" ? null : status === "match" ? possible : 0 };
  });
  const known = factors.filter(f => f.status !== "unknown");
  const earned = known.reduce((sum, f) => sum + (f.earned ?? 0), 0);
  const assessed = known.reduce((sum, f) => sum + f.possible, 0);
  const total = factors.reduce((sum, f) => sum + f.possible, 0);
  return { factors, earned, assessed, total, score: assessed ? Math.round(100 * earned / assessed) : null, coverage: total ? Math.round(100 * assessed / total) : 0 };
}

export const IMPORT_FIELDS = ["name", "businessName", "email", "phone", "website", "location", "service", "notes", "sourceDetail"] as const;
export type ImportField = typeof IMPORT_FIELDS[number];
export type ColumnMapping = Partial<Record<ImportField, string>>;
export function parseCSV(text: string) {
  const result = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ""), { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim() });
  return { rows: result.data, headers: result.meta.fields ?? [], errors: result.errors.map(e => `Row ${(e.row ?? 0) + 2}: ${e.message}`) };
}
export function suggestMapping(headers: string[]): ColumnMapping {
  const aliases: Record<ImportField, string[]> = {
    name: ["name", "full name", "contact name", "prospect name"], businessName: ["businessname", "business name", "company"],
    email: ["email", "email address"], phone: ["phone", "telephone", "phone number"], website: ["website", "url"],
    location: ["location", "city"], service: ["service", "service of interest"], notes: ["notes"], sourceDetail: ["source", "source detail"],
  };
  return Object.fromEntries(IMPORT_FIELDS.map(f => [f, headers.find(h => aliases[f].includes(h.toLowerCase())) ?? ""])) as ColumnMapping;
}
export function prepareImport(rows: Record<string, string>[], mapping: ColumnMapping, campaign: Campaign, s: AppState, authorized: boolean, sourceDetail: string) {
  const errors: string[] = [];
  const prospects: Prospect[] = [];
  if (!mapping.name) return { prospects, errors: ["Map a name column before importing."], duplicates: 0 };
  if (campaign.type === "B2C" && (!authorized || !sourceDetail.trim())) return { prospects, errors: ["B2C imports require an authorized client-provided or consent-based source and source details."], duplicates: 0 };
  let duplicates = 0;
  const seen = new Set(s.prospects.filter(p => p.email?.trim()).map(p => p.email?.trim().toLowerCase()));
  rows.forEach((row, i) => {
    const get = (field: ImportField) => (row[mapping[field] ?? ""] ?? "").trim();
    const name = get("name"); const email = get("email");
    if (!name) { errors.push(`Row ${i + 2}: name is required.`); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.push(`Row ${i + 2}: invalid email.`); return; }
    if (email && seen.has(email.toLowerCase())) { duplicates++; return; }
    if (email) seen.add(email.toLowerCase());
    const now = new Date().toISOString();
    prospects.push({ id: uid(), workspaceId: s.workspace.id, name, businessName: get("businessName"), email, phone: get("phone"),
      website: get("website"), location: get("location"), service: get("service"), notes: get("notes"),
      sourceDetail: get("sourceDetail") || sourceDetail.trim(), source: "Other", recordSource: "Imported", authorizedSource: authorized || undefined,
      campaignId: campaign.id, industryId: campaign.industryId, type: campaign.type, stageId: s.stages[0]?.id ?? "discovered", createdAt: now, updatedAt: now });
  });
  return { prospects, errors, duplicates };
}

export function generateDraft(p: Prospect, c: Campaign, workspace: Workspace, industryName: string, channel: Channel) {
  const identity = workspace.name.trim();
  const offering = c.offering.trim();
  const objective = c.objective.trim();
  const cta = c.cta.trim();
  if (!identity || !offering || !objective || !cta) return { subject: "", body: "" };
  const greeting = `Hi ${p.name},`;
  const context = `${identity} offers ${offering}.`;
  const intent = `I’m reaching out about ${objective}.`;
  const body = channel === "sms" ? `${greeting} This is ${identity}. We offer ${offering}. ${intent} ${cta}`
    : channel === "call" ? `Opening: Hello ${p.name}, I’m calling from ${identity}. Is now a suitable time to talk?\n\nPurpose: ${context} ${intent}\n\nQuestion: Is ${offering} relevant to your current needs?\n\nNext step: ${cta}\n\nIf not interested: Thank you for your time. We will respect your preference.`
    : `${greeting}\n\n${context} ${intent}\n\n${cta}\n\n${identity}${workspace.contactEmail ? `\n${workspace.contactEmail}` : ""}`;
  return { subject: channel === "email" ? `${offering} — ${industryName}` : "", body };
}