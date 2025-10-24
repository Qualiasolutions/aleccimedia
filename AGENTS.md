# Repository Guidelines

## Project Structure & Module Organization
The App Router source lives in `app/`, with feature-focused segments such as `app/(chat)` for conversation flows and `app/(auth)` for entry points. Shared UI is split between `components/` (domain components) and `components/ui/` (atomic primitives), while cross-cutting hooks reside in `hooks/`. Persistent logic, including Drizzle schema and migration helpers, sits in `lib/` and `lib/db/`; instrumentation and middleware are in the root for easy Vercel deployment. Static assets belong in `public/`, and browser-level integration clips are organized under `tests/` (see below).

## Build, Test, and Development Commands
- `pnpm install`: Install all workspace dependencies (pnpm@9 is required).
- `pnpm dev`: Start the Next.js dev server with Turbo for hot reloading.
- `pnpm build`: Run TypeScript-safe Drizzle migrations (`tsx lib/db/migrate`) and produce a production build.
- `pnpm start`: Serve the compiled build locally.
- `pnpm lint` / `pnpm format`: Apply Ultracite/Biome linting or formatting to the tracked files.
- `pnpm db:generate|push|pull|studio`: Manage Drizzle database artifacts; run these from the project root.

## Coding Style & Naming Conventions
TypeScript and React components should remain typed (no `any` unless justified). Use PascalCase for component files, camelCase for utilities, and SCREAMING_SNAKE_CASE for environment constants. Styling relies on Tailwind CSS and Radix primitives—keep utility classes readable and prefer `clsx`/`tailwind-merge` helpers for conditional styling. Always rely on `pnpm format` before committing; do not hand-edit formatting exceptions because Ultracite rules are centrally managed in `biome.jsonc`.

## Testing Guidelines
Automated checks use Playwright (`pnpm test`), which boots the dev server for end-to-end coverage. Tests are grouped by intent: `tests/e2e` for user journeys, `tests/routes` for HTTP expectations, and `tests/pages` for page contracts. Mirror this layout when adding cases, and prefer descriptive test names (`should display draft history`). When debugging locally, you can target a group with `pnpm exec playwright test tests/e2e/<file>.test.ts` and enable headed mode via `--ui`.

## Commit & Pull Request Guidelines
Craft commits as small, logical units with imperative subjects (`Add session transcript summary`). The current history is minimal—please keep summaries under ~70 characters and include context in the body when touching data or auth flows. Pull requests should describe scope, list affected routes or APIs, reference related issues, and attach screenshots or recordings for UI updates. Note any environment variables or migrations that reviewers must apply.

## Environment & Data Tips
Create a `.env.local` from `.env.example` and never commit it. Database changes should flow through Drizzle migrations (`lib/db/migrate.ts`); avoid manual schema tweaks in production. When testing third-party gateways, prefer sandbox credentials and document overrides in the PR description. Clean up temporary feature flags or seed data before merging.
