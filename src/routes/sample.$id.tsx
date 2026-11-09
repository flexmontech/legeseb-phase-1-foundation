import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "@/lib/legeseb/store";
import { SitePreview } from "@/components/legeseb/SitePreview";

export const Route = createFileRoute("/sample/$id")({
  head: () => ({
    meta: [
      { title: "Sample website preview — LEGESEB" },
      { name: "description", content: "Demonstration website preview created by LEGESEB." },
      { property: "og:title", content: "Sample website preview — LEGESEB" },
      { property: "og:description", content: "Demonstration website preview created by LEGESEB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  const s = useAppState();
  const site = s.sites?.find((x) => x.id === id);
  const p = site && s.prospects.find((x) => x.id === site.prospectId);
  if (!site) return <p className="text-sm">Sample website not found. <Link to="/showcase" className="underline">See the showcase</Link></p>;
  return (
    <div className="space-y-4">
      {p && <Link to="/prospects/$id" params={{ id: p.id }} className="text-sm text-accent underline">← Back to {p.businessName || p.name}</Link>}
      <SitePreview site={site} />
    </div>
  );
}
