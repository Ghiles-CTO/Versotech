# Repository Guidelines

## Project Structure & Module Organization
- The core Next.js app lives in `versotech-portal/`; App Router features are organized under `src/app/*` with investor flows in `versoholdings/` and staff tooling in `versotech/`.
- Shared UI is in `src/components`, hooks in `src/hooks`, domain helpers in `src/lib`, and reusable contracts in `src/types`; test doubles reside in `src/__tests__/mocks`.
- Supabase artifacts are split between `database/*.sql` (manual schema, policies) and `supabase/migrations/` (generated migrations). Automation scripts sit in `scripts/`, while platform documentation belongs in `docs/` and static collateral in `public/`.

## Build, Test, and Development Commands
- Install dependencies once per clone: `cd versotech-portal` then `npm install`.
- Use `npm run dev` for local work; investor login is exposed at `http://localhost:3000/versoholdings/login` and staff flows at `/versotech/login`.
- Run `npm run build` to validate production bundles and `npm start` to smoke-test compiled output.
- Lint before committing with `npm run lint`; prefer `npx next lint --fix` when touching many files.
- Execute specs with `npx vitest --run --setupFiles src/__tests__/setup.ts`; add `--watch` while iterating.

## Coding Style & Naming Conventions
- TypeScript strict mode is enforced; export explicit types for shared utilities and API handlers.
- Keep App Router segment folders in kebab-case, React components in PascalCase, and helper modules in camelCase.
- Tailwind CSS is the default styling layer; reach for `*.module.css` only when utility classes cannot express the layout.
- Use the `@/` path alias for intra-project imports and colocate feature mocks alongside their subjects in `src/__tests__`.

## Testing Guidelines
- Vitest with React Testing Library powers unit and integration coverage; global setup lives in `src/__tests__/setup.ts` and MSW handlers in `src/__tests__/mocks`.
- Mirror production structure in test file names (`src/app/{area}/page.test.tsx`); prefer descriptive `it('renders allocations summary')` blocks over generic wording.
- Cover loading, error, and empty states for UI surfaces; rely on utilities from `@/tests/utils/test-utils` to mock Supabase and cache layers.
- Record notable mock expectations in `docs/testing-notes.md` when you extend the MSW server.

## Commit & Pull Request Guidelines
- Follow the existing imperative sentence-case style (`Add comprehensive fee management system`). Group schema changes and their generated SQL in the same commit.
- Ensure `npm run build`, `npm run lint`, and `npx vitest --run` are green before pushing.
- Pull requests should include a concise summary, screenshots or Looms for UI changes, Supabase migration IDs, and linked backlog tickets.
- Flag configuration updates (new env vars, secrets) in the PR description and update `.env.local.example` when applicable.
