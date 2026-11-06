import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { useAppState } from "@/lib/legeseb/store";

export const Route = createFileRoute("/internal")({
  head: () => ({
    meta: [
      { title: "Internal — LEGESEB" },
      { name: "description", content: "Locked internal workspace for team-only information." },
      { property: "og:title", content: "Internal — LEGESEB" },
      { property: "og:description", content: "Locked internal workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Internal,
});

const PIN_KEY = "legeseb:pin-hash";
const NOTES_KEY = "legeseb:internal-notes";
const UNLOCK_KEY = "legeseb:unlocked";

async function hash(pin: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`legeseb:${pin}`));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function Internal() {
  const [stored, setStored] = useState<string | null | undefined>(undefined);
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setStored(localStorage.getItem(PIN_KEY));
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
  }, []);

  if (stored === undefined) return null;
  if (!unlocked) return <Gate stored={stored} onOpen={(h) => { localStorage.setItem(PIN_KEY, h); setStored(h); sessionStorage.setItem(UNLOCK_KEY, "1"); setUnlocked(true); }} />;
  return <Room onLock={() => { sessionStorage.removeItem(UNLOCK_KEY); setUnlocked(false); }} />;
}

function Gate({ stored, onOpen }: { stored: string | null; onOpen: (h: string) => void }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const creating = !stored;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(pin)) return setErr("PIN must be 4–8 digits.");
    if (creating && pin !== confirm) return setErr("PINs do not match.");
    const h = await hash(pin);
    if (!creating && h !== stored) return setErr("Incorrect PIN.");
    onOpen(h);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Lock className="h-5 w-5" /></div>
      <h1 className="text-center text-xl font-semibold">{creating ? "Set an internal PIN" : "Internal use only"}</h1>
      <label className="block text-sm">PIN
        <input type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input px-3" />
      </label>
      {creating && (
        <label className="block text-sm">Confirm PIN
          <input type="password" inputMode="numeric" autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input px-3" />
        </label>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button className="h-10 w-full rounded-md bg-primary text-primary-foreground">{creating ? "Create PIN & open" : "Unlock"}</button>
      <p className="text-xs text-muted-foreground">Privacy screen for this browser only — not account security.</p>
    </form>
  );
}

function Room({ onLock }: { onLock: () => void }) {
  const s = useAppState();
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => setNotes(localStorage.getItem(NOTES_KEY) ?? ""), []);
  const withContact = s.prospects.filter((p) => p.email || p.phone);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Internal — sensitive information</h1>
          <p className="text-sm text-muted-foreground">Team-only notes and full contact details.</p>
        </div>
        <button onClick={onLock} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"><Lock className="h-4 w-4" /> Lock</button>
      </div>
      <div className="flex gap-2 rounded-xl border border-border bg-muted p-3 text-sm">
        <ShieldAlert className="h-5 w-5 shrink-0" /> Data stays in this browser. For true security (team logins, server-protected data) we will need to move storage to the cloud.
      </div>
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 font-medium">Confidential notes</h2>
        <textarea aria-label="Confidential notes" value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} rows={6} className="w-full rounded-md border border-input p-3 text-sm" placeholder="Pricing, margins, client agreements, access details…" />
        <button onClick={() => { localStorage.setItem(NOTES_KEY, notes); setSaved(true); }} className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save notes</button>
        {saved && <span className="ml-3 text-sm text-muted-foreground">Saved</span>}
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 font-medium">Contact directory ({withContact.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Business</th><th>Contact</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {withContact.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2"><Link to="/prospects/$id" params={{ id: p.id }} className="hover:underline">{p.businessName || p.name}</Link></td>
                  <td>{p.name}</td><td>{p.email}</td><td className="whitespace-nowrap">{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
