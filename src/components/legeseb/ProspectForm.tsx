import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/legeseb/store";
import { LEAD_SOURCES, type Prospect, type TargetType } from "@/lib/legeseb/model";

export type ProspectInput = Omit<Prospect, "id" | "workspaceId" | "createdAt" | "updatedAt" | "demo">;

const sel = "h-9 w-full rounded-md border border-input bg-card px-2 text-sm";

export function ProspectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<ProspectInput>;
  onSubmit: (p: ProspectInput) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const s = useAppState();
  const defaultInd =
    initial?.industryId ?? (s.activeIndustryId !== "all" ? s.activeIndustryId : s.industries[0]?.id ?? "general");
  const [f, setF] = useState<ProspectInput>({
    name: "",
    businessName: "",
    industryId: defaultInd,
    type: s.industries.find((i) => i.id === defaultInd)?.targetType ?? "B2C",
    email: "",
    phone: "",
    website: "",
     source: LEAD_SOURCES[0] ?? "Other",
     recordSource: "Manual",
    service: "",
    stageId: s.stages[0]?.id ?? "discovered",
    notes: "",
    ...initial,
  });
  const ind = s.industries.find((i) => i.id === f.industryId);
  const set = <K extends keyof ProspectInput>(k: K, v: ProspectInput[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
         if (!f.name.trim()) return;
         if (f.type === "B2C" && !f.demo && (!f.authorizedSource || !f.sourceDetail?.trim())) return;
        onSubmit({ ...f, name: f.name.trim() });
      }}
    >
      <Field label={`${ind?.prospectSingular ?? "Prospect"} name *`}>
        <Input required value={f.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Business name (optional)">
        <Input value={f.businessName ?? ""} onChange={(e) => set("businessName", e.target.value)} />
      </Field>
      <Field label="Industry">
        <select
          className={sel}
          value={f.industryId}
          onChange={(e) => {
            const ni = s.industries.find((i) => i.id === e.target.value);
            setF((x) => ({ ...x, industryId: e.target.value, service: "", type: ni?.targetType ?? x.type }));
          }}
        >
          {s.industries.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Type">
        <select className={sel} value={f.type} onChange={(e) => set("type", e.target.value as TargetType)}>
          <option value="B2B">B2B (business)</option>
          <option value="B2C">B2C (consumer)</option>
        </select>
      </Field>
      <Field label="Service of interest">
        <select className={sel} value={f.service ?? ""} onChange={(e) => set("service", e.target.value)}>
          <option value="">— None —</option>
          {ind?.services.map((sv) => (
            <option key={sv} value={sv}>{sv}</option>
          ))}
        </select>
      </Field>
      <Field label="Lead source">
        <select className={sel} value={f.source} onChange={(e) => set("source", e.target.value)}>
          {LEAD_SOURCES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </Field>
      <Field label="Email (optional)">
        <Input type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Phone (optional)">
        <Input type="tel" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Website (optional)">
        <Input value={f.website ?? ""} onChange={(e) => set("website", e.target.value)} />
      </Field>
      <Field label="Location (optional)">
        <Input value={f.location ?? ""} onChange={(e) => set("location", e.target.value)} />
      </Field>
      <Field label={`Source details${f.type === "B2C" && !f.demo ? " *" : " (optional)"}`}>
        <Input required={f.type === "B2C" && !f.demo} value={f.sourceDetail ?? ""} onChange={(e) => set("sourceDetail", e.target.value)} />
      </Field>
      <label className="flex items-start gap-2 text-sm sm:col-span-2">
        <input type="checkbox" required={f.type === "B2C" && !f.demo} checked={f.authorizedSource ?? false} onChange={(e) => set("authorizedSource", e.target.checked)} />
        Authorized client-provided or consent-based source{f.type === "B2C" && !f.demo ? " *" : ""}
      </label>
      <Field label="Pipeline stage">
        <select className={sel} value={f.stageId} onChange={(e) => set("stageId", e.target.value)}>
          {s.stages.map((st) => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes">
          <Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
<label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>
  );
}
