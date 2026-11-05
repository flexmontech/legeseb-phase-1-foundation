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
- LEGESEB Phase 1 stores all data in browser localStorage via `src/lib/legeseb/store.ts`; pure logic lives in `model.ts` so it can move to a database later.
- Industries are configuration records (presets + custom), never per-industry pages.
- Never modify or use the data/database of the reference project "Web Sales Connect"; read-only reference only.
- Phase 2 extends the existing browser store with optional campaign and draft collections, normalizing old records on load to preserve Phase 1 data; pure CSV, qualification, and template logic lives in phase2.ts for testability and future migration.
- CSV parsing uses Papa Parse, with reviewed column mappings, explicit authorization for B2C imports, and duplicate-email detection; no discovery provider or remote website audit is connected.
