# External Integrations

**Analysis Date:** 2026-01-23

## Authentication

**Supabase Auth:**
- Type: OAuth + Email/Password + Magic Link
- Implementation: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Client: Singleton pattern browser client with PKCE flow
- Server: Server-side authenticated client via cookies
- Middleware: `src/middleware.ts` - Token refresh with retry logic (exponential backoff up to 30 seconds)
- Session: localStorage persistence with automatic refresh
- Database: PostgreSQL `auth.users` table via Supabase
- Env Vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Cookie Names: `sb-kagzryotbbnusdcyvqei-auth-token`, `sb-kagzryotbbnusdcyvqei-auth-token-code-verifier` (hardcoded for production DB)
- RLS Enabled: All database access controlled by Row-Level Security policies

## Data Storage

**Primary Database:**
- Postgres via Supabase
- Project ID: kagzryotbbnusdcyvqei (hardcoded in middleware cookie names)
- Connection: Via Supabase client (`NEXT_PUBLIC_SUPABASE_URL`)
- Tables: profiles, users, deals, subscriptions, investors, entities, vehicles, fee_plans, workflow_runs, etc.
- Schema: Fully custom domain model (investment banking platform)
- ORM: None - Direct SQL via Supabase client with explicit column selection

**File Storage:**
- Supabase Storage (S3-compatible)
- Buckets:
  - `documents` - General documents
  - `deal-documents` - Deal-specific files and subscription packs
  - `docs` - Documentation
  - `signatures` - Signed PDFs (separate bucket from deal-documents)
- Access: Via `supabase.storage.from('bucket-name').download()` and `.upload()`
- Signed URLs: Generated for temporary access (e.g., 3600s for unsigned PDFs)
- Implementation: `src/lib/signature/storage.ts` - SignatureStorageManager
- File Key Format: UUID-based paths with descriptive subdirectories

## Email Service

**Resend (Transactional Email):**
- Service: Resend API v1
- Endpoint: `https://api.resend.com/emails`
- Auth: Bearer token via `RESEND_API_KEY` environment variable
- Implementation: `src/lib/email/resend-service.ts`
- Default From: `VERSO <onboarding@resend.dev>` (testing domain, configurable via `EMAIL_FROM`)
- Templates:
  - Staff invitation with credentials
  - Password reset with CTA button
  - Security alerts (account deactivation, permission changes, password changed)
  - Invitation emails (investor/staff/professional specific content)
  - Signature request emails with signing links
- Response Format: JSON with email ID (`data.id`)
- Status Checks: Validates API key at module load in production
- Runtime: Fetch-based, runs on Node.js (server routes only)

## PDF Processing

**Document Conversion (Gotenberg):**
- Service: Gotenberg document conversion
- Type: Self-hosted containerized service
- Endpoint: `GOTENBERG_URL` (default: `http://gotenberg:3000`)
- Operations:
  - DOCX → PDF via LibreOffice endpoint: `POST /forms/libreoffice/convert`
  - HTML → PDF via Chromium endpoint: `POST /forms/chromium/convert/html`
- Implementation: `src/lib/gotenberg/convert.ts`
- Health Check: `GET /health` with 5s timeout
- Use Cases:
  - Subscription pack generation (DOCX template → PDF)
  - Certificate generation (HTML → PDF)
- Request Format: FormData with file blob
- Response: ArrayBuffer with binary PDF data
- Error Handling: Detailed logging with status codes and error text

**PDF Manipulation (pdf-lib):**
- Package: pdf-lib 1.17.1
- Operations: Embed signatures into PDF documents
- Implementation: `src/lib/signature/pdf-processor.ts`
- Features:
  - embedSignatureInPDF - Single signature location
  - embedSignatureMultipleLocations - Multi-page signatures (subscription documents)
- Signature Data: Data URLs (canvas-based PNG signature)
- Metadata: Embed signer name and timestamp in PDF
- Page References: Zero-indexed page numbers and coordinate positioning

**PDF Parsing (pdfjs-dist):**
- Package: pdfjs-dist 5.4.530
- Operations: Text extraction, anchor detection
- Implementation: `src/lib/signature/anchor-detector.ts`
- Use Case: Detect `SIG_ANCHOR_*` markers in subscription PDFs to automatically position signatures

## Workflow Automation

**N8N Webhook Triggers:**
- Service: n8n (self-hosted or cloud)
- Type: HTTP webhook callbacks
- Endpoints: Defined in `workflows` table (`n8n_webhook_url`)
- Implementation: `src/lib/trigger-workflow.ts` - triggerWorkflow()
- Auth:
  - Header: `x-verso-signature` (HMAC-SHA256 signature)
  - Header: `x-idempotency-key` (SHA256 hash of workflow+user+payload)
  - Secret: `N8N_WEBHOOK_SECRET` or `N8N_OUTBOUND_SECRET` environment variable
- Payload Structure:
  ```typescript
  {
    workflow_run_id: string,
    workflow_key: string,
    triggered_by: {
      id, email, display_name, role, title
    },
    payload: Record<string, any>,
    entity_type: string
  }
  ```
- Database Tracking: `workflow_runs` table
  - Status flow: queued → running → completed/failed
  - Output stored in `output_data` (JSON)
  - Error messages in `error_message`
- Binary Response Handling: Automatic detection and arrayBuffer streaming
- Idempotency: Token-based deduplication
- Env Vars: `N8N_WEBHOOK_SECRET`, `N8N_OUTBOUND_SECRET`

**Workflow Database:**
- Table: `workflows` (active workflows)
- Columns: id, key, is_active, n8n_webhook_url
- Table: `workflow_runs` (execution history)
- Columns: workflow_id, triggered_by, status, input_params, output_data, error_message, idempotency_token, webhook_signature, timestamps

## Document Access & Sharing

**Google Drive Integration (Read-Only):**
- Purpose: Fetch PDF documents for signature workflows
- Method: HTTPS download via Google Drive sharing links
- Implementation: `src/lib/signature/client.ts` - downloadPDFFromUrl()
- URL Format: `google_drive_url` field in signature_requests
- Security: Public shareable links (no OAuth required)
- Use Case: Template subscription packs and NDA documents
- Storage: Downloaded PDFs cached in Supabase Storage (`unsigned_pdf_path`)

## Multi-Signatory Workflows

**Signature Management System:**
- Implementation: `src/lib/signature/client.ts` - Comprehensive signature orchestration
- Database Tables:
  - `signature_requests` - Individual signature requests
  - `signature_placements` - Multi-page signature positions
- Features:
  - Token-based signing links (7-day expiry by default)
  - Progressive signing (chain signatures on multi-page documents)
  - Duplicate prevention (prevents re-requesting signatures)
  - Concurrent signing with workflow-level locking
  - Multi-signatory support (party_a, party_b, party_c positions)
  - Anchor-based placement detection (SIG_ANCHOR markers in PDFs)
  - Automatic task creation and notification
- Document Types:
  - `subscription` - Multi-page documents with anchor markers
  - `nda` - Single-page non-disclosure agreements
  - `introducer_agreement` - Partner agreements
  - `placement_agreement` - Placement agreements
- Signing Process:
  1. User navigates to signing URL with token
  2. System validates token expiry and status
  3. User draws/uploads signature on canvas
  4. Server embeds signature in PDF(s)
  5. PDF stored in Supabase
  6. Status updated to "signed"
  7. Auto-completes related tasks
  8. Checks if all signatories complete
  9. If complete, executes post-signature handler

## Caching

**No Third-Party Caching Service Detected**
- In-Memory: React Query/SWR not found in dependencies
- Redis/Memcached: Not configured
- Local Storage: Browser localStorage for session persistence
- Server Caching: Supabase edge functions (if used)

## Error Tracking & Monitoring

**No Third-Party Error Tracking Configured**
- Console logging throughout codebase
- Comments indicate Sentry integration as TODO
- Audit logging to database table `audit_logs`
- Middleware error capturing with encoded detail messages

## Monitoring & Observability

**Audit Logging:**
- Implementation: `src/lib/audit.ts`
- Storage: `audit_logs` table
- Columns: event_type, actor_id, action, entity_type, entity_id, action_details, timestamp
- Events: All mutations tracked (workflow triggers, signature submissions, subscriptions, fee operations)
- Scope: User actions, system actions, API calls

**Performance Monitoring:**
- Implementation: `src/lib/performance-monitor.ts`
- Metrics: Function execution time, memory usage
- Export: Detailed performance reports

**Health Checks:**
- Gotenberg: Health endpoint check with timeout
- Supabase: Connection validation via auth.getUser()

## Messaging & Notifications

**In-App Notifications:**
- Table: `investor_notifications`
- Schema: user_id, type, title, message, action_url, metadata
- Implementation: Created during signature workflows, subscription events
- Types: signature_required, investment_commitment, payment_status
- Display: Investor portal notifications tab

**Task System:**
- Table: `tasks`
- Types: countersignature, subscription_pack_signature, deal_nda_signature, manual_follow_up
- Categories: signatures, payments, approvals, other
- Ownership: owner_user_id, owner_investor_id, owner_ceo_entity_id
- Status Flow: pending → in_progress → completed
- Rich Instructions: Action URLs, metadata, step-by-step guidance

## Webhooks & Callbacks

**Incoming Webhooks:**
- Test Endpoint: `POST /api/workflows/test-webhook`
- N8N Webhook Routes: `POST /api/workflows/[key]/trigger`
- Signature Completion: `POST /api/signature/complete` (handles post-signature logic)

**Outgoing Webhooks:**
- N8N Triggers: HTTP POST to workflow `n8n_webhook_url` with signature validation
- Email Callbacks: None (Resend is fire-and-forget)
- Database Change Notifications: Via Supabase realtime subscriptions (if configured)

## External Service Availability

**Critical Path:**
- Supabase (auth, database) - **CRITICAL** - App cannot function without it
- Resend (email) - **Important** - Invitations fail silently, users cannot be onboarded
- Gotenberg (PDF conversion) - **Important** - Subscription pack generation fails

**Optional Path:**
- N8N (workflows) - **Important** - Invoice generation, document workflows fail
- Google Drive (document access) - **Fallback** - Documents can be uploaded directly to storage

---

*Integration audit: 2026-01-23*
