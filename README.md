# LEGESEB

LEGESEB is a configurable lead-generation and lead-management application for small businesses. It combines a prospect CRM foundation with industry configuration, campaign-based discovery workflows, transparent qualification, CSV import, and editable outreach drafts.

> **Current scope:** The repository has moved beyond the original Phase 1 foundation. The implementation includes Phase 2 discovery and preparation features. See [roadmap.md](./roadmap.md) for the recorded delivery checklist.

## What the application does

- **Dashboard:** summarizes prospect and pipeline records.
- **Prospects:** create, edit, search, filter, and review prospect records.
- **Pipeline:** move prospects through configurable stages.
- **Industry configuration:** use shared presets or add custom industries without creating separate industry-specific applications.
- **Discovery and campaigns:** configure a target audience and offering, then organize prospect discovery and qualification.
- **CSV import:** parse files, map source columns to prospect fields, review validation errors, and detect duplicate email addresses. B2C imports require an authorized source declaration and source details.
- **Qualification:** apply configurable criteria and show both the score and the amount of information assessed. Unknown fields are not silently treated as failures.
- **Web readiness:** optional checks of supplied website URL format and HTTPS status. This is not a live website audit or external crawling service.
- **Outreach drafts:** prepare editable email, SMS, and call drafts for copying. The app does not send messages.

The repository's roadmap records 26 audited Chicago leads loaded into the pilot. Treat prospect data as operational data, not as proof that a prospect has been contacted or converted.

## Data and workspace behavior

The client-side state layer in `src/lib/legeseb/store.ts` supports two modes:

- **Demo mode:** the Chicago pilot is stored in the current browser's `localStorage`. Data is local to that browser and is not automatically shared with another device or user.
- **Cloud workspace mode:** the store can activate a signed-in workspace and persist changes through a supplied backend save function. Workspace isolation and actual deployment configuration depend on the connected backend/authentication setup.

The Internal PIN is a browser privacy screen, **not a security boundary**. Browser-only data and client-side controls must not be treated as production multi-user access control. Review the authentication, backend policies, and deployment configuration before using real customer or sensitive personal data.

## Technical overview

- React 19 and TypeScript
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS and Radix UI components
- Supabase client integration is present in the dependency set and `src/integrations`
- Papa Parse for CSV parsing
- Vitest and Testing Library for automated tests

### Key source areas

| Path | Purpose |
| --- | --- |
| `src/routes/` | Application routes and screens |
| `src/components/` | Shared interface components |
| `src/lib/legeseb/model.ts` | Core data types, industry presets, pipeline stages, demo seed state |
| `src/lib/legeseb/store.ts` | Application state, browser persistence, workspace activation |
| `src/lib/legeseb/phase2.ts` | CSV parsing/import, qualification, provenance, outreach draft generation |
| `src/lib/legeseb/industryCatalog.ts` | Industry catalog |
| `src/lib/legeseb/chicagoLeads.ts` | Chicago pilot prospect seed data |
| `src/lib/legeseb/workspaces.ts` | Workspace-related logic |
| `src/lib/legeseb/*.test.ts` and `src/test/` | Automated tests |
| `supabase/` | Supabase project configuration |
| `drizzle/` and `drizzle.config.ts` | Drizzle database tooling/configuration |

## Local development

The project uses Bun lockfiles and Bun-compatible scripts. Install Bun first, then:

```sh
git clone https://github.com/flexmontech/legeseb-phase-1-foundation.git
cd legeseb-phase-1-foundation
bun install
bun run dev
```

Useful commands from `package.json`:

```sh
bun run build
bun run lint
bun run test
bun run test:watch
bun run format
```

Do not commit local environment files or secrets. The repository contains a root `.env` path; verify that it is ignored and that no credentials or private values are tracked before sharing or deploying the repository.

## Project documentation

- [roadmap.md](./roadmap.md) — implementation checklist and recorded milestones.
- [AGENTS.md](./AGENTS.md) — project-specific development guidance and architecture notes, including the Lovable sync warning.
- This README — product overview, current capabilities, data limitations, and developer setup.

## Important boundaries

- LEGESEB is an independent project. The reference project named in the original build brief is for workflow inspiration only; do not access or reuse its production data, credentials, or database.
- Do not claim that the application is production-ready for multi-tenant use without verifying authentication, authorization, backend row-level policies, and workspace isolation.
- Website readiness checks are limited to supplied URL format/HTTPS signals; they are not a security scan, SEO audit, or live website assessment.
- Outreach is draft-only. There is no email, SMS, or calling provider sending messages.
- Do not add paid data-provider integrations or automated prospect scraping without explicit scope and cost approval.

## Current status

The codebase includes the original prospect-management foundation and documented Phase 2 additions. The roadmap currently marks the foundation, discovery/import/qualification batches, draft generation, regression checks, and Chicago pilot data load as complete. That checklist is a project record, not an independent production-readiness or security certification.
