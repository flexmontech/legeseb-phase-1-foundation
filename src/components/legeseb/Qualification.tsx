import { qualify, type Campaign } from "@/lib/legeseb/phase2";
import type { Prospect } from "@/lib/legeseb/model";

export function Qualification({ prospect, campaign }: { prospect: Prospect; campaign: Campaign }) {
  const result = qualify(prospect, campaign);
  return <section className="space-y-3 border-t border-border pt-5">
    <h2 className="font-medium">Qualification · {campaign.name}</h2>
    <div className="flex flex-wrap gap-4 text-sm">
      <span className="font-semibold">{result.score === null ? "Unknown" : `${result.score}% match on known factors`}</span>
      <span>{result.earned} / {result.assessed} assessed points</span>
      <span className="text-muted-foreground">{result.coverage}% evidence coverage · {result.total} possible points</span>
    </div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="text-xs text-muted-foreground"><tr><th className="p-2">Factor</th><th className="p-2">Evidence / expected</th><th className="p-2">Result</th><th className="p-2">Points</th></tr></thead>
      <tbody>{result.factors.map(f => <tr key={f.id} className="border-t border-border">
        <td className="p-2">{f.label}</td><td className="max-w-xs break-words p-2">{f.observed}{f.expected && ` / ${f.expected}`}</td>
        <td className="p-2">{f.status === "unknown" ? "Unknown" : f.status === "match" ? "Match" : "No match"}</td>
        <td className="whitespace-nowrap p-2">{f.status === "unknown" ? "—" : f.earned ?? 0} / {f.possible}</td>
      </tr>)}</tbody>
    </table></div>
    {campaign.webReadiness && <p className="text-xs text-muted-foreground">Web Readiness: supplied URL format and HTTPS scheme only. Website not fetched or audited; availability, content, speed, security and quality are unknown.</p>}
  </section>;
}