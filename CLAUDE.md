# mysovera-pathologyreport

<!-- Managed by Launchpad. Edits here may be overwritten on next sync. -->

## Stack & commands

- Framework: Next.js
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `lint`: `next lint`
- `start`: `next start`

## Decisions

- Navigation UI pattern: left nav + hamburger menu added to both dashboard and customer portal

## Architecture

- Report package now has tiered structure (Basic/Standard/Premium) with tier-based billing implementation
- Customer self-serve portal now includes magic-link login and report history view

## Notes

- Referring doctor email feature has been added to the codebase
