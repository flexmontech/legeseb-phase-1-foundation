import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { update, useAppState } from "@/lib/legeseb/store";
import { IMPORT_FIELDS, parseCSV, suggestMapping, prepareImport, type ColumnMapping, type Campaign } from "@/lib/legeseb/phase2";

export function CSVImport({ campaign }: { campaign: Campaign }) {
  const s = useAppState();
  const [csv, setCSV] = useState<ReturnType<typeof parseCSV> | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [authorized, setAuthorized] = useState(false);
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("");
  const [reading, setReading] = useState(false);
  const preview = csv ? prepareImport(csv.rows, mapping, campaign, s, authorized, detail) : null;
  return <section className="space-y-4 border-y border-border py-5">
    <h2 className="font-medium">CSV import · {campaign.name}</h2>
    <label className="grid gap-2 text-sm">CSV file<Input type="file" accept=".csv,text/csv" disabled={reading} onChange={async e => {
      const file = e.target.files?.[0]; if (!file) return;
      setStatus(""); setCSV(null);
      if (file.size > 5 * 1024 * 1024) { setStatus("Choose a CSV file smaller than 5 MB."); return; }
      setReading(true);
      try { const parsed = parseCSV(await file.text()); setCSV(parsed); setMapping(suggestMapping(parsed.headers)); }
      catch { setStatus("The file could not be read. Choose a valid CSV file."); }
      finally { setReading(false); }
    }} /></label>
    {reading && <p role="status">Reading file…</p>}
    {csv && <>
      <div className="grid gap-3 sm:grid-cols-3">{IMPORT_FIELDS.map(f => <label key={f} className="grid gap-1.5 text-sm">{f === "businessName" ? "Business name" : f === "sourceDetail" ? "Source details" : f}{f === "name" ? " *" : ""}
        <select className="h-9 rounded-md border border-input bg-card px-2 text-sm" aria-label={`Map ${f}`} value={mapping[f] ?? ""} onChange={e => setMapping(x => ({ ...x, [f]: e.target.value }))}><option value="">Not mapped</option>{csv.headers.map(h => <option key={h} value={h}>{h}</option>)}</select>
      </label>)}</div>
      <label className="grid gap-1.5 text-sm">Source details{campaign.type === "B2C" ? " *" : ""}<Input value={detail} onChange={e => setDetail(e.target.value)} /></label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={authorized} onChange={e => setAuthorized(e.target.checked)} />I confirm this is an authorized client-provided or consent-based source.</label>
      {campaign.type === "B2C" && <p className="text-sm text-muted-foreground">Consumer contacts require an authorized source. Public business directories are not consumer lead sources.</p>}
      <p className="text-sm">{csv.rows.length} rows · {preview?.prospects.length ?? 0} ready · {preview?.duplicates ?? 0} duplicate emails skipped · {preview?.errors.length ?? 0} invalid rows / source issues</p>
      {csv.errors.length > 0 && <div role="alert" className="text-sm">CSV errors — import blocked:<ul>{csv.errors.slice(0, 10).map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      {(preview?.errors.length ?? 0) > 0 && <ul role="alert" className="text-sm">{preview?.errors.slice(0, 10).map((x, i) => <li key={i}>{x}</li>)}</ul>}
      {(preview?.prospects.length ?? 0) > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Location</th><th className="p-2">Source</th></tr></thead><tbody>{preview?.prospects.slice(0, 5).map(p => <tr key={p.id} className="border-t border-border"><td className="p-2">{p.name}</td><td className="p-2">{p.email || "—"}</td><td className="p-2">{p.location || "Unknown"}</td><td className="p-2">Imported</td></tr>)}</tbody></table></div>}
      <Button disabled={!preview?.prospects.length || csv.errors.length > 0} onClick={() => {
        const ready = prepareImport(csv.rows, mapping, campaign, s, authorized, detail);
        if (!ready.prospects.length || csv.errors.length) return;
        update(st => ({ ...st, prospects: [...ready.prospects, ...st.prospects] }));
        setStatus(`${ready.prospects.length} prospects imported. ${ready.duplicates} duplicates skipped. ${ready.errors.length} invalid rows skipped.`); setCSV(null);
      }}>Import valid rows</Button>
    </>}
    {status && <p role="status" className="text-sm">{status}</p>}
  </section>;
}