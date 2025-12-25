# AGENTS.md

## Commands (run from `versotech-portal/`)
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx vitest run       # Run all tests
npx vitest run src/__tests__/path/to/file.test.tsx  # Single test file
```

## Code Style
- **TypeScript**: Strict mode enabled; use explicit types, avoid `any`
- **Imports**: Use `@/*` path alias (maps to `src/*`); group: external → internal → relative
- **Components**: PascalCase files (`DealCard.tsx`); use `'use client'` only when needed
- **Routes**: kebab-case (`/kyc-review`); all active routes under `/versotech_main/*`
- **Database**: snake_case for tables/columns; always specify columns in SELECT (no `SELECT *`)
- **Supabase**: Use `createClient` from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server)
- **Error handling**: Validate with Zod; handle errors gracefully with try/catch; log sensitive ops via `auditLogger`
- **Formatting**: Tailwind CSS for styling; shadcn/ui components; Lucide icons
- **RLS**: Security enforced at DB level via Row-Level Security policies—never rely on app-level filtering
