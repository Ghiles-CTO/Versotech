# Codebase Concerns

**Analysis Date:** 2026-01-23

## Test Coverage Gaps

**Severely Limited Test Suite:**
- Issue: Only 13 test files for ~345K lines of code (codebase coverage <1%)
- Files affected: `src/__tests__/` (entire directory)
- Impact: Critical business logic (commission accrual, deal close, subscriptions) has zero unit tests. Regressions go undetected.
- Risk: Fee calculations, signature workflows, and multi-party approvals could silently fail in production
- Priority: **CRITICAL** - Add tests for:
  - `src/lib/fees/calculations.ts` - Fee/commission calculations
  - `src/lib/deals/deal-close-handler.ts` - Deal closure and commission creation
  - `src/lib/signature/client.ts` and `handlers.ts` - Signature workflow orchestration
  - `src/app/api/approvals/[id]/action/route.ts` - Approval state machine
  - `src/lib/subscription/certificate-trigger.ts` - Certificate generation

**Integration Test Gaps:**
- Issue: No integration tests for multi-step workflows (signature → certificate → commission)
- Files affected: Deal closing, investor onboarding, fee accrual workflows
- Safe modification: Create `src/__tests__/integration/` with E2E flow tests for critical paths

## Tech Debt

**Unfinished Features & TODO Comments:**
- Issue: 29+ TODO/FIXME comments scattered throughout codebase
- Location: Critical paths:
  - `src/middleware.ts:382` - Missing monitoring/alerting for refresh token errors
  - `src/lib/signature/handlers.ts:1812` - Amendment post-signature logic unimplemented
  - `src/app/(investor)/versoholdings/tasks/tasks-page-client.tsx:430` - Deal-specific filtering TODO
  - `src/components/holdings/position-detail-modal.tsx:95` - `position_lots` table not implemented
  - `src/app/api/cron/fees/generate-scheduled/route.ts:155-156` - Auto-invoice and reminder creation unimplemented
  - `src/components/subscriptions/subscription-bulk-actions.tsx:165,176` - Bulk email and bulk report not implemented
- Impact: Features appear functional but fail silently in edge cases. Incomplete workflows block user actions.
- Fix approach: Convert TODOs to GitHub issues with priority labels. Estimate effort. Add feature flags to disable incomplete paths.

**Hardcoded Supabase Project ID:**
- Issue: Supabase auth cookie names hardcoded with project ID `sb-kagzryotbbnusdcyvqei-*`
- Files: `src/middleware.ts:393-429` (appears 6 times)
- Impact: Switching to different Supabase project breaks authentication silently. GOTCHA documented in CLAUDE.md.
- Fix approach: Load from environment variable, store in `.env.local`. Add validation in middleware initialization.

**Console Logging in Production:**
- Issue: Extensive `console.log()` and `console.error()` calls throughout critical paths
- Files affected:
  - `src/lib/signature/client.ts` - 50+ log statements
  - `src/lib/signature/handlers.ts` - 100+ DEBUG/INFO logs
  - `src/app/api/approvals/[id]/action/route.ts` - 10+ DEBUG logs
  - `src/app/api/subscriptions/[id]/regenerate/route.ts` - 5+ logs
- Impact: Verbose logging slows down response times and reveals sensitive information in logs (user IDs, investor names, deal details)
- Fix approach: Replace with proper logging library (Winston, Pino). Use structured logging with severity levels. Strip logs in production build.

## Fragile Areas

**Multi-Signature Workflow (Fragile - Requires ALL Signatures):**
- Files: `src/lib/signature/handlers.ts` (2026 lines), `src/lib/signature/client.ts` (2003 lines)
- Why fragile:
  - Partial signatures cannot progress (documented GOTCHA). If one signer doesn't sign, entire workflow blocks indefinitely.
  - No timeout mechanism for signature requests (signers could disappear)
  - State machine logic in `handlers.ts` has 2000+ lines with complex conditional branches
  - No automatic reminder emails for unsigned documents
- Safe modification:
  - Add request expiry dates with cron job to mark expired requests
  - Add email reminder triggers at T+7 days unsigned
  - Add admin override capability to complete signatures without final signer
  - Break handlers.ts into smaller focused modules by document type
  - Write integration tests for each signature flow (NDA → Placement → Termsheet → Amendment)

**Large Monolithic Components (Poor Separation of Concerns):**
- Issue: Several components exceed 1300+ lines
- Files:
  - `src/components/entities/entity-detail-enhanced.tsx` (2852 lines) - Entity management mega-component
  - `src/app/api/approvals/[id]/action/route.ts` (2180 lines) - Approval state machine mega-route
  - `src/components/deals/investor-deals-list-client.tsx` (1694 lines) - Deal list with inline logic
  - `src/components/deals/deal-term-sheet-tab.tsx` (1625 lines) - Term sheet editing
  - `src/components/fees/ScheduleTab.tsx` (1536 lines) - Fee schedule inline calculations
- Impact: Hard to test. Single bug can break entire feature. Difficult to maintain and reason about.
- Safe modification:
  - Extract business logic into `src/lib/entities/` or `src/lib/approvals/` modules
  - Break components into smaller presentational + container pattern
  - Move state management into custom hooks
  - Add unit tests for extracted logic modules

**KYC Wizard State Management (Pattern: Closure Hell):**
- Files: `src/components/kyc/wizard/WizardContext.tsx`
- Why fragile:
  - Multiple bug fixes documented (BUG FIX 2.1, 2.2, 2.3, 2.7, 3.1, 4.1) indicate accumulated complexity
  - Uses refs to bypass React state (`isSavingRef`, `isDirtyRef`, `isSubmittedRef`, `saveProgressRef`) - signs of race condition handling
  - Hidden steps cause index corruption (`currentStepIndex = -1` handling at line 102)
  - Auto-save timer can conflict with manual save
- Safe modification:
  - Add comprehensive logging to trace state transitions
  - Write integration tests for step visibility changes (US Person toggle)
  - Extract auto-save into separate custom hook `useAutoSave()`
  - Use finite state machine (xstate) instead of refs

**Deal Close Handler - Critical Path (1272 lines):**
- Files: `src/lib/deals/deal-close-handler.ts`
- Why fragile:
  - Handles 7 concurrent operations: subscriptions, positions, commissions, certificates, fee plans, notifications, audit logs
  - Single failure in one operation leaves others partially executed
  - No transaction rollback on partial failure
  - Commission accrual notification loop (line 67-82) could fail silently if any user ID is invalid
  - Gaps documented: GAP-5 (commission accrual tracking), GAP-7 (audit logging)
- Safe modification:
  - Add try-catch around each major operation with detailed error logging
  - Return detailed error array with operation name and error message
  - Implement transaction wrapper to rollback all changes on any failure
  - Add circuit breaker for notification failures (don't block cert generation)

**Approval Action Route - State Machine (2180 lines):**
- Files: `src/app/api/approvals/[id]/action/route.ts`
- Why fragile:
  - Handles 6+ different approval types with type-specific logic
  - Subscription pack filename generation logic mixed with approval state changes
  - Multiple service calls with no coordinated error handling
  - Type coercion issues: `as string` casts throughout without validation
  - DEBUG log at line 494 suggests known issues with data inconsistency
- Safe modification:
  - Extract approval handlers into separate modules by type
  - Create `ApprovalService` class with typed methods
  - Add schema validation before type coercion
  - Remove all DEBUG logging, add proper error tracking

## Performance Bottlenecks

**Unoptimized Database Queries (No Caching):**
- Issue: Staff dashboard data fetched on every page load without caching
- Files: `src/lib/staff/dashboard-data.ts`, `src/lib/staff/dashboard-cache.ts` (indicates caching added but may not be complete)
- Queries affected:
  - Investor list fetches (50+ queries for all user types)
  - KYC pipeline calculations
  - Fee schedule aggregations
- Impact: P1 operations (CEO dashboard) could timeout on production with >10K investors
- Improvement path:
  - Use `getCachedStaffDashboardData()` already in place at `src/app/(main)/versotech_main/dashboard/page.ts:28`
  - Validate cache TTL and invalidation triggers
  - Add Redis caching for frequently accessed data (vehicle lists, entity names)
  - Use database indexes on (status, created_at) for filtering operations

**PDF Generation & Storage Operations (Sequential):**
- Issue: Certificate generation, signature embedding, and PDF upload happen sequentially in handlers
- Files: `src/lib/signature/handlers.ts:124-200`, `src/lib/subscription/certificate-trigger.ts`
- Impact: Each document takes 2-5 seconds to generate. Batch operations block indefinitely.
- Improvement path:
  - Implement async queue (Bull, RabbitMQ) for PDF operations
  - Generate certificates in background worker, notify via webhook
  - Use Gotenberg service more efficiently - batch conversions

**React Component Re-renders (Missing Memoization):**
- Issue: Large table components re-render on every parent state change
- Files: `src/components/deals/investor-deals-list-client.tsx:1311` (DEBUG log suggests render performance issues)
- Components: Deal lists, investor lists, transaction tables
- Improvement path:
  - Add `useMemo` and `useCallback` for filtered/mapped data
  - Use React.memo for row components
  - Virtualize tables with `@tanstack/react-table` (already imported but may not be fully optimized)

## Security Considerations

**File Upload Validation (Partially Addressed):**
- Risk: File type validation in `src/app/api/documents/upload/route.ts:121-125` checks MIME type only
- Impact: Malicious files could bypass upload by spoofing MIME type
- Current mitigation: Whitelist of allowed types (PDF, DOCX, XLSX, TXT, JPG, PNG)
- Recommendations:
  - Add magic bytes validation (check file signatures, not just extension)
  - Scan uploads with YARA rules or ClamAV for malware
  - Store uploads outside web root, serve via proxy with Content-Disposition: attachment
  - Implement virus scanning on upload (ClamAV, VirusTotal API)

**Authentication Cookie Hardcoding:**
- Risk: Supabase project ID in cookie names prevents multi-tenant deployment
- Files: `src/middleware.ts` (lines 393, 409, 426, 428)
- Impact: Switching projects or adding test environments breaks auth
- Recommendations:
  - Move to env var `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
  - Validate against `NEXT_PUBLIC_SUPABASE_URL` to catch misconfigurations
  - Add startup check that ensures cookie config matches active project

**RLS Policy Bypass Potential:**
- Risk: Extensive use of `createServiceClient()` (bypasses RLS) without explicit auth checks
- Files: Used in 35+ files across API routes. Examples:
  - `src/app/api/approvals/[id]/action/route.ts:69` - Service client used after basic auth check
  - `src/lib/deals/deal-close-handler.ts` - Service operations on deal/commission creation
  - `src/lib/notifications.ts:5` - Notification creation bypasses RLS
- Current mitigation: Routes check user.role before calling service functions
- Recommendations:
  - Create permission helper `requirePermission(user, 'deal:approve', dealId)`
  - Add audit logging for all service client operations (already implemented via `auditLogger`)
  - Add @deprecated comment to service client calls with links to permission function
  - Regular RLS policy audits (check if policies are actually restrictive)

**Staff Override for Document Validation:**
- Risk: Staff can override document validation without permanent audit trail
- Files: `src/app/api/documents/upload/route.ts:88-105`
- Impact: Staff could upload expired/invalid documents to bypass compliance
- Recommendations:
  - Require second staff approval for overrides
  - Increase audit log retention (currently just warnings in `validation_notes`)
  - Add email notification to compliance team on overrides
  - Monthly override audit report to management

## Scaling Limits

**Supabase Real-time Subscriptions (Not Implemented):**
- Current: Components fetch data on mount, no live updates
- Files: Dashboard components wait for cache refresh to see updates
- Limit: Multiple staff members modifying same deal = stale views
- Scaling path:
  - Implement Supabase real-time subscriptions for deals, subscriptions, approvals
  - Add optimistic updates on mutations
  - Use SWR or React Query with revalidate-on-focus

**Database Connection Pooling:**
- Risk: Each API route gets fresh Supabase client without connection pooling
- Impact: With 100+ concurrent users, connection pool exhaustion is likely
- Scaling path:
  - Implement Supabase connection pool config (already available in `@supabase/supabase-js`)
  - Add max connection limits
  - Monitor connection count in Supabase metrics

**File Storage Scalability:**
- Current: Direct file uploads to Supabase Storage (good for <1M files)
- Limit: At 10K+ active investors, document bucket growth exponential
- Scaling path:
  - Implement document lifecycle management (archive after 3 years)
  - Move old documents to cold storage (S3 Glacier)
  - Add document compression for PDFs
  - Implement CDN for document downloads (Cloudflare)

## Known Issues & Gotchas

**"Invalid Refresh Token: Already Used" Race Condition:**
- Symptom: Users randomly get logged out with "Invalid Refresh Token: Already Used"
- Root cause: Multiple simultaneous requests both attempt to refresh the same token
- Current mitigation: Middleware clears session and redirects to login (lines 380-399)
- Gotcha (from CLAUDE.md): Dual refresh token refresh = race condition. Middleware correctly handles this but with side effect of logout.
- Issue: User experience is poor (sudden logout). Should implement token retry with exponential backoff instead.
- Fix approach:
  - Add retry logic with jitter in `src/lib/supabase/client.ts`
  - Only clear session on genuinely invalid tokens (signature mismatch), not just "already used"
  - Log rate and timing of this error to identify high-concurrency patterns

**Hash Capture in Auth Callback (Module Load Requirement):**
- Gotcha (from CLAUDE.md): Hash capture must happen at MODULE LOAD, not in useEffect
- Files: `src/app/(public)/versotech_main/login/page.tsx` and reset-password pages
- Risk: Moving hash capture to useEffect breaks magic links
- Why: Auth fragment is lost when React hydrates (browser replaces #hash when DOM updates)
- Current: Likely correct but not documented in component comments
- Recommendation: Add JSDoc comment explaining this to prevent future refactors

**Commission Basis Always "funded_amount" Regardless of Fee Plan:**
- Gotcha (from CLAUDE.md): Commission basis is always `funded_amount`, not affected by fee tiers
- Files: `src/lib/fees/calculations.ts` (commission calculations)
- Risk: Developers may assume fee tiers affect partner commissions (they don't, only investor fees)
- Impact: Commission overpayment if complex fee structures assumed to reduce partner payments
- Recommendation: Add constant with comment explaining this business rule

**Platform Tour Auto-Launch:**
- Issue: Platform tour config at `src/config/platform-tour.ts` (1111 lines) may auto-launch on every login
- Impact: Could be annoying for returning users
- Recommendation: Check if tour dismissal is persisted to localStorage/profile
- Safe check: Search for `platform-tour` usage in dashboard components

## Dependency Issues

**Type Safety Issues (187 instances of `any`):**
- Issue: Widespread use of `any` type and `as any` casts
- Impact: TypeScript provides no type checking. Runtime errors in production.
- Risk files:
  - `src/components/kyc/wizard/WizardContext.tsx` - Form data types
  - `src/lib/signature/handlers.ts` - Signature data handling
  - `src/app/api/approvals/[id]/action/route.ts` - Approval polymorphism
- Improvement: Convert critical paths to strict typing using Zod + TypeScript
  - Start with API request/response types
  - Add `"strict": true` to tsconfig.json

**Unvalidated External Dependencies:**
- Issue: PDF processing libraries have known vulnerabilities
- Files: `src/app/api/subscriptions/[id]/regenerate/route.ts` (uses `pdf-lib`)
- Recommendation:
  - Run `npm audit` regularly
  - Update `pdf-lib` (version 1.17.1 is from 2021)
  - Consider alternatives: PDFKit, pdfjs (already using pdfjs-dist)
  - Add security scanning to CI/CD (npm audit, Snyk)

## Technical Debt Opportunities

**State Management Fragmentation:**
- Issue: Multiple patterns used for state (refs, hooks, context, custom hooks)
- Files scattered across components
- Opportunity: Standardize on Zustand or Redux for complex shared state

**API Route Organization:**
- Issue: API routes mix concerns (validation, auth, business logic, storage)
- Opportunity: Create `src/lib/api-handlers/` for business logic, keep routes thin

**Error Handling Inconsistency:**
- Issue: Some routes return 400, others 422, others 500 for validation errors
- Opportunity: Create `src/lib/api-response.ts` with standardized error responses

## Summary

**Highest Priority Fixes:**
1. Add unit tests for fee/commission calculations and deal close handler
2. Implement monitoring for refresh token race condition
3. Extract logic from mega-components (entity-detail, approval-action, deal-term-sheet)
4. Convert TODOs to tracked issues with effort estimates
5. Replace console.log with structured logging library

**Medium Priority (Refactoring):**
1. Move signature handlers into smaller modules by document type
2. Break KYC wizard into state machine pattern
3. Add comprehensive error handling with detailed logging
4. Optimize database queries with proper caching

**Low Priority (Nice to Have):**
1. Add API documentation (OpenAPI/Swagger)
2. Implement real-time subscriptions for live data sync
3. Migrate to serverless DB driver for better scaling
4. Add E2E tests with Playwright for critical workflows

---

*Concerns audit: 2026-01-23*
