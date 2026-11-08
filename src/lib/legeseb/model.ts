import { CHICAGO_LEADS } from "./chicagoLeads";
export type TargetType = "B2B" | "B2C";

export interface Industry {
  id: string;
  name: string;
  services: string[];
  prospectSingular: string;
  prospectPlural: string;
  targetType: TargetType;
  custom?: boolean;
}

export interface Stage {
  id: string;
  name: string;
}

export interface Prospect {
  id: string;
  workspaceId: string;
  name: string;
  businessName?: string | undefined;
  industryId: string;
  type: TargetType;
  email?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
  source: string;
  service?: string | undefined;
  stageId: string;
  notes: string;
  recordSource?: "Manual" | "Imported" | "Demo" | "Connected provider" | undefined;
  sourceDetail?: string;
  location?: string;
  authorizedSource?: boolean | undefined;
  campaignId?: string;
  demo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
}

export interface AppState {
  version: 1;
  workspace: Workspace;
  activeIndustryId: string; // "all" or industry id
  industries: Industry[];
  stages: Stage[];
  prospects: Prospect[];
  campaigns?: import("./phase2").Campaign[];
  drafts?: import("./phase2").OutreachDraft[];
  sites?: import("./sampleSite").SampleSite[];
}

export const ALL = "all";
export const LEAD_SOURCES = ["Referral", "Website", "Walk-in", "Event", "Social media", "Cold outreach", "Other"];

export const PRESETS: Industry[] = [
  { id: "spa", name: "Spa and wellness", services: ["Massage", "Facials", "Wellness packages"], prospectSingular: "Guest", prospectPlural: "Guests", targetType: "B2C" },
  { id: "dental", name: "Dental", services: ["Check-up & cleaning", "Whitening", "Orthodontics"], prospectSingular: "Patient", prospectPlural: "Patients", targetType: "B2C" },
  { id: "hvac", name: "HVAC", services: ["Installation", "Maintenance plan", "Emergency repair"], prospectSingular: "Customer", prospectPlural: "Customers", targetType: "B2C" },
  { id: "office", name: "Office services", services: ["Cleaning", "Supplies", "Facilities management"], prospectSingular: "Account", prospectPlural: "Accounts", targetType: "B2B" },
  { id: "garden", name: "Gardening and landscaping", services: ["Lawn care", "Garden design", "Seasonal cleanup"], prospectSingular: "Client", prospectPlural: "Clients", targetType: "B2C" },
  { id: "realestate", name: "Real estate", services: ["Buying", "Selling", "Property management"], prospectSingular: "Lead", prospectPlural: "Leads", targetType: "B2C" },
  { id: "itai", name: "IT and AI services", services: ["Managed IT", "AI automation", "Cloud migration"], prospectSingular: "Company", prospectPlural: "Companies", targetType: "B2B" },
  { id: "nails", name: "Nail salons", services: ["Manicure", "Pedicure", "Nail art"], prospectSingular: "Client", prospectPlural: "Clients", targetType: "B2C" },
  { id: "restaurants", name: "Restaurants", services: ["Online ordering", "Reservations", "Catering"], prospectSingular: "Restaurant", prospectPlural: "Restaurants", targetType: "B2C" },
  { id: "bars", name: "Bars and cocktail lounges", services: ["Private events", "Promotions"], prospectSingular: "Venue", prospectPlural: "Venues", targetType: "B2C" },
  { id: "clinics", name: "Clinics and medical practices", services: ["Appointments", "Patient intake"], prospectSingular: "Practice", prospectPlural: "Practices", targetType: "B2C" },
  { id: "roofing", name: "Roofing contractors", services: ["Inspection", "Repair", "Replacement"], prospectSingular: "Contractor", prospectPlural: "Contractors", targetType: "B2C" },
  { id: "general", name: "General / Other", services: ["Consultation", "Standard service"], prospectSingular: "Prospect", prospectPlural: "Prospects", targetType: "B2C" },
];

export const DEFAULT_STAGES: Stage[] = [
  // Verified from the reference project (read-only): editable in Settings.
  { id: "discovered", name: "Discovered" },
  { id: "ready", name: "Active Ready" },
  { id: "pitched", name: "Pitched" },
  { id: "viewed", name: "Viewed" },
  { id: "won", name: "Won" },
];

export const DEMO_WORKSPACE_ID = "demo-workspace";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "industry";
}

export function createSeedState(now = new Date().toISOString()): AppState {
  const prospects: Prospect[] = CHICAGO_LEADS.map((l, i) => ({
    id: `chi-${i + 1}`,
    workspaceId: DEMO_WORKSPACE_ID,
    name: l.contact || l.businessName,
    businessName: l.businessName,
    industryId: l.industryId,
    type: l.type,
    email: l.email || undefined,
    phone: l.phone || undefined,
    website: l.website || undefined,
    location: l.location,
    source: "Other",
    sourceDetail: l.sourceUrl,
    stageId: "discovered",
    recordSource: "Imported",
    authorizedSource: true,
    notes: l.notes,
    createdAt: now,
    updatedAt: now,
  }));
  return {
    version: 1,
    workspace: {
      id: DEMO_WORKSPACE_ID,
      name: "Chicago Pilot Workspace",
      description: "Audited Chicago-area prospects from published business contacts.",
      contactEmail: "",
    },
    activeIndustryId: ALL,
    industries: PRESETS.map((p) => ({ ...p })),
    stages: DEFAULT_STAGES.map((s) => ({ ...s })),
    prospects,
  };
}

/* ---------- pure reducers ---------- */

export function filterByIndustry(prospects: Prospect[], industryId: string) {
  return industryId === ALL ? prospects : prospects.filter((p) => p.industryId === industryId);
}

export function stageCounts(prospects: Prospect[], stages: Stage[]) {
  return stages.map((s) => ({ stage: s, count: prospects.filter((p) => p.stageId === s.id).length }));
}

export function addIndustry(state: AppState, input: Omit<Industry, "id" | "custom">): AppState {
  let id = slugify(input.name);
  while (state.industries.some((i) => i.id === id)) id += "-x";
  return { ...state, industries: [...state.industries, { ...input, id, custom: true }] };
}

export function setActiveIndustry(state: AppState, id: string): AppState {
  return { ...state, activeIndustryId: id };
}

export function moveProspect(state: AppState, prospectId: string, stageId: string): AppState {
  return {
    ...state,
    prospects: state.prospects.map((p) =>
      p.id === prospectId ? { ...p, stageId, updatedAt: new Date().toISOString() } : p,
    ),
  };
}
