<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- `store.ts` holds one AppState in two modes: the Chicago demo in browser localStorage, or a signed-in live workspace stored as one JSON state row per workspace in the backend (workspaces.ts); isolation is enforced by membership RLS, and demo data never enters live workspaces.
- Sample websites are one reusable template (sampleSite.ts + /sample/$id), created only on request per prospect, always labeled as demonstration content and blocked from fabricated claims.
- Industries are configuration records (presets + custom), never per-industry pages.
- Never modify or use the data/database of the reference project "Web Sales Connect"; read-only reference only.
- Phase 2 extends the existing browser store with optional campaign and draft collections, normalizing old records on load to preserve Phase 1 data; pure CSV, qualification, and template logic lives in phase2.ts for testability and future migration.
- CSV parsing uses Papa Parse, with reviewed column mappings, explicit authorization for B2C imports, and duplicate-email detection; no discovery provider or remote website audit is connected.
- Navigation has two lanes: a public top bar (Home, Audiences, Industry Explorer, Sample Showcase) and a separate Operator Portal bar for working tools and the PIN-gated Internal page, so visitors never see back-office tools. The 165-industry catalog lives in industryCatalog.ts and becomes a configured industry only when targeted. The Internal PIN is a browser privacy screen, not security.
