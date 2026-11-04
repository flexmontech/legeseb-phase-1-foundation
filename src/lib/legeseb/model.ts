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
  businessName?: string;
  industryId: string;
  type: TargetType;
  email?: string;
  phone?: string;
  website?: string;
  source: string;
  service?: string;
  stageId: string;
  notes: string;
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
  const prospects: Prospect[] = [];
  PRESETS.forEach((ind, i) => {
    [0, 1].forEach((j) => {
      const n = i * 2 + j;
      const b2b = ind.targetType === "B2B" || j === 1;
      prospects.push({
        id: `demo-${ind.id}-${j + 1}`,
        workspaceId: DEMO_WORKSPACE_ID,
        name: `Demo ${ind.prospectSingular} ${j + 1}`,
        businessName: b2b ? `Fictional ${ind.name.split(" ")[0]} Co. (demo)` : undefined,
        industryId: ind.id,
        type: b2b ? "B2B" : "B2C",
        email: `demo${n + 1}@example.com`,
        source: LEAD_SOURCES[n % LEAD_SOURCES.length]!,
        service: ind.services[j % ind.services.length],
        stageId: DEFAULT_STAGES[n % DEFAULT_STAGES.length]!.id,
        notes: "Fictional demo record — not a real person or business.",
        demo: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
  return {
    version: 1,
    workspace: {
      id: DEMO_WORKSPACE_ID,
      name: "Demo Client Workspace",
      description: "A fictional business used to demonstrate LEGESEB.",
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
