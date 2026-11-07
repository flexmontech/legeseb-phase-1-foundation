# LEGESEB Phase 1 Foundation

PHASE 1 OF 2 — BUILD THE LEGESEB FOUNDATION ONLY

CREDIT AND SCOPE CONTROL
Build only the foundation described below.
Do not implement Phase 2 features.
Avoid unnecessary redesigns, elaborate animations, large demo datasets, or separate page implementations for each industry.
Use shared components and configuration-driven content.
If something requires a paid integration or materially expands the scope, disclose it and defer it.

1. PROJECT BOUNDARY — CHECK THIS FIRST
Create LEGESEB as a NEW, INDEPENDENT project.

Use @Kinetiq ONLY as a reference for workflows and interface patterns.
Do NOT modify, rename, overwrite, rebrand, or change Kinetiq.
Do NOT use Kinetiq’s production database, authentication, credentials, or customer data.

If this chat cannot create or access a separate project, STOP and tell me what I need to do first. Do not make changes to Kinetiq.

2. PRODUCT GOAL
Build a reusable lead-generation and lead-management foundation that different businesses can configure for different industries.

Keep these concepts separate:
- Client workspace: the business using LEGESEB.
- Target industry: the market that business wants to reach.
- Prospect: a potential customer.

For Phase 1, provide ONE demo client workspace. Structure records so they can support additional workspaces later, but do not build multi-user onboarding, workspace switching, or production multi-tenant access controls yet.

Do not describe this phase as production-ready for multiple clients.

3. MINIMUM SCREENS
Build only:
- Dashboard: prospect counts and pipeline summary derived from saved records.
- Prospects: list, search, filtering, manual creation, editing, and prospect details.
- Pipeline: five stages with working stage changes.
- Settings: client profile and industry configuration.

Use persistent storage appropriate to the standalone project. State what storage is used and any limitations.

All core actions must work. Do not add nonfunctional buttons.

4. INDUSTRY CONFIGURATION
Use one shared application driven by industry settings—not duplicated pages.

Include lightweight presets for:
- Spa and wellness.
- Dental.
- HVAC.
- Office services.
- Gardening and landscaping.
- Real estate.
- IT and AI services.
- Nail salons.
- General / Other.

Each preset needs only:
- Industry name.
- Example services.
- Prospect terminology.
- Default B2B or B2C target type, editable by the user.

Include a simple “Add custom industry” form using the same configuration structure.

Provide a target-industry selector. Changing it should update relevant labels, service options, and prospect filtering without deleting or rewriting existing records.

5. PROSPECT DATA
Support:
- Prospect name.
- Business name, optional for individual consumers.
- Industry.
- B2B or B2C type.
- Email and phone, optional.
- Website, optional.
- Lead source.
- Pipeline stage.
- Notes.

Do not require a website or business name for every prospect.

6. PIPELINE
Use Kinetiq’s five stages only if you can inspect and verify them.
Otherwise use these defaults and disclose that they are defaults:
New → Qualified → Contacted → Proposal / Offer → Won

Allow stage names to be edited.
Save stage changes persistently.

7. MINIMAL DEMO DATA
Create only TWO clearly labeled fictional prospects per starter industry.
Distribute them across pipeline stages to demonstrate functionality.

Do not generate full websites, reviews, extensive activity histories, or large campaign datasets.
Do not invent real contact details or imply fictional businesses are real.

Provide useful empty states when filters return no records.

8. BRANDING
Use LEGESEB for application navigation, titles, and footer.
Do not reuse Kinetiq branding.

Use https://www.flexmon.tech as the color reference if its visual styling is accessible.
If you cannot inspect its colors, ask me for a screenshot or brand colors before styling. Do not invent a matching palette.

Use a simple responsive interface and centralized design tokens.
Prioritize usable forms, clear navigation, and readable tables over decorative effects.

9. EXPLICITLY OUT OF SCOPE
Do NOT build in Phase 1:
- Live prospect discovery or scanning.
- External data-provider integrations.
- AI-generated outreach.
- Email or SMS sending.
- Calling integrations.
- Website audits or Web Readiness scoring.
- Generated sample websites.
- Visitor tracking.
- Campaign automation.
- Multi-user onboarding or production multi-tenant access controls.
- Billing.

Do not build placeholder pages for these features.

10. COMPLETION CHECK
Verify:
- Kinetiq remains unchanged.
- LEGESEB is an independent project.
- Prospect creation and editing work.
- Records and pipeline changes persist.
- Industry switching works.
- A custom industry can be added without code changes.
- B2B and B2C prospects are supported.
- Dashboard totals match saved records.
- The interface works on desktop and mobile.

At completion, summarize what works, storage limitations, and anything deferred.
STOP after Phase 1. Do not automatically begin Phase 2.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f00703f3-f5c0-41ad-b209-24e337fe009a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
