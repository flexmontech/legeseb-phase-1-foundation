import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetDemo, update, useAppState } from "@/lib/legeseb/store";
import { addIndustry, type TargetType } from "@/lib/legeseb/model";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LEGESEB" },
      { name: "description", content: "Client profile, industries and pipeline stages for LEGESEB." },
      { property: "og:title", content: "Settings — LEGESEB" },
      { property: "og:description", content: "Client profile, industries and pipeline stages for LEGESEB." },
    ],
  }),
  component: SettingsPage,
});

const sel = "h-9 w-full rounded-md border border-input bg-card px-2 text-sm";
const card = "rounded-lg border border-border bg-card p-5 space-y-4";

function SettingsPage() {
  const s = useAppState();
  const [ws, setWs] = useState(s.workspace);
  const [stages, setStages] = useState(s.stages);
  const [saved, setSaved] = useState("");
  const [ci, setCi] = useState({ name: "", services: "", prospectSingular: "Prospect", prospectPlural: "Prospects", targetType: "B2C" as TargetType });
  const flash = (m: string) => { setSaved(m); setTimeout(() => setSaved(""), 2000); };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {saved && <p role="status" className="text-sm text-accent">{saved}</p>}

      <section className={card}>
        <h2 className="font-medium">Client profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Business name"><Input value={ws.name} onChange={(e) => setWs({ ...ws, name: e.target.value })} /></F>
          <F label="Contact email"><Input type="email" value={ws.contactEmail} onChange={(e) => setWs({ ...ws, contactEmail: e.target.value })} /></F>
          <div className="sm:col-span-2"><F label="Description"><Input value={ws.description} onChange={(e) => setWs({ ...ws, description: e.target.value })} /></F></div>
        </div>
        <Button onClick={() => { update((st) => ({ ...st, workspace: ws })); flash("Profile saved."); }}>Save profile</Button>
      </section>

      <section className={card}>
        <h2 className="font-medium">Pipeline stages</h2>
        <div className="grid gap-2 sm:grid-cols-5">
          {stages.map((st, i) => (
            <Input key={st.id} aria-label={`Stage ${i + 1}`} value={st.name} onChange={(e) => setStages(stages.map((x) => (x.id === st.id ? { ...x, name: e.target.value } : x)))} />
          ))}
        </div>
        <Button onClick={() => { update((x) => ({ ...x, stages: stages.map((st) => ({ ...st, name: st.name.trim() || "Untitled" })) })); flash("Stages saved."); }}>Save stages</Button>
      </section>

      <section className={card}>
        <h2 className="font-medium">Industries</h2>
        <p className="text-xs text-muted-foreground">Default B2B/B2C type is applied to new prospects and can be changed per prospect.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="p-2">Industry</th><th className="p-2">Services</th><th className="p-2">Term</th><th className="p-2">Default</th></tr>
            </thead>
            <tbody>
              {s.industries.map((ind) => (
                <tr key={ind.id} className="border-t border-border">
                  <td className="p-2">{ind.name}{ind.custom && <span className="ml-1 text-xs text-muted-foreground">(custom)</span>}</td>
                  <td className="p-2 text-xs">{ind.services.join(", ")}</td>
                  <td className="p-2">{ind.prospectPlural}</td>
                  <td className="p-2">
                    <select aria-label={`Default type for ${ind.name}`} className="h-8 rounded border border-input bg-card px-1 text-xs" value={ind.targetType}
                      onChange={(e) => update((st) => ({ ...st, industries: st.industries.map((x) => (x.id === ind.id ? { ...x, targetType: e.target.value as TargetType } : x)) }))}>
                      <option>B2B</option><option>B2C</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const services = ci.services.split(",").map((x) => x.trim()).filter(Boolean);
            if (!ci.name.trim()) return;
            update((st) => addIndustry(st, { ...ci, name: ci.name.trim(), services }));
            setCi({ ...ci, name: "", services: "" });
            flash("Custom industry added.");
          }}
        >
          <h3 className="text-sm font-medium sm:col-span-2">Add custom industry</h3>
          <F label="Industry name *"><Input required value={ci.name} onChange={(e) => setCi({ ...ci, name: e.target.value })} /></F>
          <F label="Example services (comma separated)"><Input value={ci.services} onChange={(e) => setCi({ ...ci, services: e.target.value })} /></F>
          <F label="Prospect term (singular)"><Input required value={ci.prospectSingular} onChange={(e) => setCi({ ...ci, prospectSingular: e.target.value })} /></F>
          <F label="Prospect term (plural)"><Input required value={ci.prospectPlural} onChange={(e) => setCi({ ...ci, prospectPlural: e.target.value })} /></F>
          <F label="Default target type">
            <select className={sel} value={ci.targetType} onChange={(e) => setCi({ ...ci, targetType: e.target.value as TargetType })}>
              <option>B2B</option><option>B2C</option>
            </select>
          </F>
          <div className="flex items-end"><Button type="submit">Add industry</Button></div>
        </form>
      </section>

      <section className={card}>
        <h2 className="font-medium">Demo data</h2>
        <p className="text-sm text-muted-foreground">Restore the original demo workspace. This erases all changes saved in this browser.</p>
        <Button variant="outline" onClick={() => { if (confirm("Reset all data to the demo state?")) { resetDemo(); window.location.reload(); } }}>Reset to demo data</Button>
      </section>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}
