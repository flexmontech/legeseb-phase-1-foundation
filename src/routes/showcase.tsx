import { createFileRoute, redirect } from "@tanstack/react-router";

// Preserve bookmarks while retiring the duplicate page. Saved data is untouched.
export const Route = createFileRoute("/showcase")({
  beforeLoad: () => { throw redirect({ to: "/discovery", statusCode: 301 }); },
  head: () => ({ meta: [
    { title: "Lead generation — LEGESEB" },
    { name: "description", content: "Continue to the focused LEGESEB business lead-generation workflow." },
    { property: "og:title", content: "Lead generation — LEGESEB" },
    { property: "og:description", content: "Continue to the LEGESEB lead-generation workflow." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
