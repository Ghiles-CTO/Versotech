# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5 - Full codebase including components, API routes, utilities
- JavaScript (Node.js) - Build tooling, scripts

**Secondary:**
- HTML5 - Email templates (rendered via Resend)
- CSS3 (Tailwind) - All styling

## Runtime

**Environment:**
- Node.js (LTS) - Via Next.js 15 server runtime

**Package Manager:**
- npm
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**
- Next.js 15.0.7 - Full-stack React framework with App Router
- React 19.2.1 - UI library
- React DOM 19.2.1 - DOM rendering

**UI & Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- shadcn/ui - Headless component library
- Radix UI (multiple packages) - Accessible primitives: accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, label, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group, tooltip
- Class Variance Authority 0.7.1 - Variant pattern management
- Tailwind Merge 3.3.1 - Merge conflicting Tailwind classes

**Forms & Validation:**
- React Hook Form 7.63.0 - Form state management
- @hookform/resolvers 5.2.2 - Schema validation bridge
- Zod 4.1.11 - Schema validation and TypeScript inference

**Charts & Data Visualization:**
- Chart.js 4.5.0 - Chart rendering library
- React ChartJS 2 5.3.0 - React wrapper for Chart.js
- Recharts 2.15.4 - React composable charting library

**Tables:**
- TanStack React Table 8.21.3 - Headless table component library

**Date & Time:**
- date-fns 4.1.0 - Immutable date utility library
- React Day Picker 9.11.1 - Date picker component

**PDF & Document Processing:**
- pdf-lib 1.17.1 - PDF manipulation (signature embedding)
- pdf-parse 2.4.5 - PDF text extraction
- pdfjs-dist 5.4.530 - PDF.js distribution for client-side rendering

**Animation & Motion:**
- Framer Motion 12.23.24 - React animation library
- Canvas Confetti 1.9.4 - Confetti effect animations
- Tailwind Animate 1.0.7 - Animation preset utilities

**UI Components & Utilities:**
- Lucide React 0.544.0 - Icon library (1000+ SVG icons)
- Tabler Icons React 3.35.0 - Additional icon set
- cmdk 1.1.1 - Command menu component
- sonner 2.0.7 - Toast notification library
- vaul 1.1.2 - Drawer/modal component

**3D Graphics:**
- Three.js 0.181.2 - 3D graphics library
- @react-three/fiber 9.4.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Utility components for React Three

**File Upload:**
- React Dropzone 14.3.8 - Drag-and-drop file upload

**Signature Capture:**
- React Signature Canvas 1.1.0-alpha.2 - Canvas-based signature drawing

**Utilities:**
- Marked 11.1.1 - Markdown parser
- Lodash.groupby 4.6.0 - Array grouping utility
- clsx 2.1.1 - Conditional class name utility

**Theme Management:**
- next-themes 0.4.6 - Theme provider and switcher

## Testing

**Test Runner:**
- Vitest 4.0.16 - Unit and integration test runner
- Config: `vitest.config.ts`

**Test Environment:**
- Happy DOM 20.0.11 - Lightweight DOM implementation
- jsdom 27.3.0 - Full DOM implementation for integration tests

**Testing Utilities:**
- @testing-library/react 16.3.1 - React component testing
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/user-event 14.6.1 - User interaction simulation

**API Mocking:**
- MSW 2.12.7 - Mock Service Worker for API mocking

**Type Stubs:**
- @types/react 19.2.7
- @types/react-dom 19.2.3
- @types/node 20.19.17
- @types/canvas-confetti 1.9.0
- @types/three 0.181.0

**Run Commands:**
```bash
npm run dev                 # Start dev server
npm run build             # Production build
npm run lint              # Run ESLint
# Test commands inferred from vitest config
```

## External Integrations

**Database & Auth:**
- Supabase 2.57.4 (supabase-js) - PostgreSQL + RLS authentication
- @supabase/ssr 0.7.0 - Server-side authentication helper
- @supabase/auth-ui-react 0.4.7 - Pre-built auth UI components
- @supabase/auth-ui-shared 0.1.8 - Shared auth UI utilities

**Email Service:**
- Resend 6.4.2 - Email API for transactional emails

**Build & Dev Tools:**
- ESLint 9 - Code linting (config: `eslint.config.mjs`)
- Prettier - Code formatting (config: `.prettierrc`)
- PostCSS 8.5.6 - CSS transformation
- Autoprefixer 10.4.21 - Browser prefix generation
- Husky 9.1.7 - Git hooks
- Turbopack - Next.js bundler (configured in `next.config.ts`)

**Utilities & Environment:**
- Cross-env 10.1.0 - Cross-platform environment variable setting
- Dotenv-cli 11.0.0 - .env file CLI loading
- Env-cmd 11.0.0 - Environment-specific config

## Configuration

**Environment Variables:**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# N8N Workflows
N8N_INVOICE_GENERATION_WEBHOOK_URL=...
N8N_OUTBOUND_SECRET=...
N8N_INBOUND_SECRET=...

# E-Signature
ESIGN_API_KEY=...
ESIGN_WEBHOOK_SECRET=...

# Document Storage
STORAGE_BUCKET_NAME=documents
DEAL_DOCUMENTS_BUCKET=deal-documents
DOCS_BUCKET=docs

# PDF Processing
GOTENBERG_URL=http://gotenberg:3000

# Email
RESEND_API_KEY=...
EMAIL_FROM=VERSO <onboarding@resend.dev>

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**TypeScript Configuration:**
- Target: ES2017
- Module: esnext
- Module Resolution: bundler
- Path Aliases: `@/*` → `./src/*`
- JSX: react-jsx
- Strict Mode: enabled
- No Emit: true (Next.js handles compilation)

**Build Configuration:**
- Next.js 15 with Turbopack bundler
- Image optimization enabled for Supabase CDN
- Remote patterns configured for Supabase (`*.supabase.co`)
- Legacy route redirects (301 permanent)

## Platform Requirements

**Development:**
- Node.js LTS
- npm
- Next.js dev server: `npm run dev`
- Port: 3000 (default)

**Production:**
- Node.js LTS runtime
- Environment variables configured
- Supabase project (PostgreSQL + authentication)
- Resend account (email sending)
- Gotenberg service (PDF conversion)
- N8N instance (workflow automation)

**Deployment:**
- Vercel (recommended for Next.js)
- Or any Node.js hosting (AWS, Railway, etc.)

## Key Dependencies by Purpose

**Critical (Core Functionality):**
- Next.js 15 - Application framework
- React 19 - UI framework
- Supabase - Database and authentication
- TypeScript - Type safety

**Important (Feature-Critical):**
- React Hook Form + Zod - Form validation
- Tailwind CSS - Styling
- shadcn/ui - Component library
- Resend - Email service
- pdf-lib - PDF manipulation (signatures)
- Gotenberg - Document conversion

**Enhancement (Feature Enablers):**
- Framer Motion - Animations
- Three.js - 3D graphics
- Recharts - Data visualization
- TanStack React Table - Complex tables

**Development:**
- ESLint - Code quality
- Vitest - Testing
- MSW - API mocking
- Husky - Pre-commit hooks

---

*Stack analysis: 2026-01-23*
