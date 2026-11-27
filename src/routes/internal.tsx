import { createFileRoute, redirect } from "@tanstack/react-router";

// Preserve bookmarks while retiring the duplicate page. Saved data is untouched.
export const Route = createFileRoute("/internal")({
  beforeLoad: () => { throw redirect({ to: "/settings", statusCode: 301 }); },
  head: () => ({ meta: [
    { title: "Workspace settings — LEGESEB" },
    { name: "description", content: "Continue to the focused LEGESEB business lead-generation workflow." },
    { property: "og:title", content: "Workspace settings — LEGESEB" },
    { property: "og:description", content: "Continue to the LEGESEB lead-generation workflow." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
