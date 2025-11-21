# Repository Guidelines

## Project Structure & Module Organization
The Vite + React frontend lives in `src`, where `components/ui` stores shadcn primitives, `components/layout` wraps shared chrome, and `pages` hosts route-level views wired by React Router. Keep cross-cutting state inside `contexts` or `hooks`, and isolate fetchers/utilities under `lib` or `config` with strongly typed models from `types`. Static assets come from `public` (favicons, manifest, service worker), while Supabase artifacts sit in `docs/supabase-schema.sql` and `supabase/functions/get-quote` for Edge Functions; update both whenever backend contracts move.

## Build, Test, and Development Commands
- `npm install`: install workspace dependencies (Node 18+).
- `npm run dev`: start the Vite dev server on `http://localhost:5173` with hot reload.
- `npm run build`: production bundle with optimized chunks and Tailwind purging.
- `npm run build:dev`: fast development build useful for CI smoke checks.
- `npm run preview`: serve the build output for QA before deploying to Vercel.
- `npm run lint`: execute the shared ESLint config to ensure hooks and React rules stay consistent.

## Coding Style & Naming Conventions
Use TypeScript everywhere, prefer functional React components, and keep indentation at two spaces (match existing files such as `src/main.tsx`). Components and hooks follow `PascalCase` (`BrandLogo.tsx`) and `camelCase` (`usePortfolio.ts`) respectively; colocate feature-specific components inside folders like `src/components/dashboard`. Tailwind classes should be composed with `clsx`/`tailwind-merge` to avoid duplicates, and reusable UI goes through shadcn generators to keep `components/ui` authoritative. Run `npm run lint` before pushing; configure IDEs to respect the repo ESLint + Tailwind IntelliSense setup.

## Testing Guidelines
Automated tests are not yet wired into `package.json`, so every feature must come with clear manual verification steps (auth, dashboard charts, Supabase mutations). When adding coverage, prefer Vitest + React Testing Library colocated under `__tests__` within each feature directory; snapshot-only tests are discouraged, focus on behavior. Edge Function changes in `supabase/functions` need accompanying local curl examples or Postman collections plus evidence they run via `supabase functions serve`.

## Commit & Pull Request Guidelines
Recent history favors concise, imperative subjects (e.g., `ajuste de readme`) and prefacing Dyad-driven work with `[dyad]`. Keep commits scoped to one topic, reference related tickets/Notion cards in the body, and describe Supabase migrations or schema updates explicitly. Pull requests must include: summary, screenshots or Loom for UI tweaks, Supabase env expectations (`.env.local` keys), and checkboxes for lint/build execution. Mention any docs touched in `docs/` so reviewers can validate schema drift.

## Security & Configuration Tips
Never commit real Supabase credentials; store them in `.env.local` and document new variables inside `README.md`. SQL or storage changes belong in `docs/supabase-schema.sql` so other agents can reapply them safely. Use least-privilege API keys and ensure client-side guards mirror Supabase Row Level Security policies before exposing new data in the UI.
