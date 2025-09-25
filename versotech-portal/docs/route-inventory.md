# Route & Component Inventory (2025-09-24)

## App Routes

| Route | File | Notes |
| --- | --- | --- |
| / | src/app/page.tsx | Landing chooser for investor vs staff portals. |
| /test | src/app/test/page.tsx | Demo/testing sandbox page. |
| /versotech/login | src/app/(public)/versotech/login/page.tsx | Staff login screen for demo auth. |
| /versoholdings/login | src/app/(public)/versoholdings/login/page.tsx | Investor login screen for demo auth. |
| /versoholdings/dashboard | src/app/(investor)/versoholdings/dashboard/page.tsx | Investor KPI dashboard fed by Supabase queries. |
| /versoholdings/holdings | src/app/(investor)/versoholdings/holdings/page.tsx | Portfolio holdings summary and allocation detail. |
| /versoholdings/deals | src/app/(investor)/versoholdings/deals/page.tsx | Investor-facing deal directory. |
| /versoholdings/deal/[id] | src/app/(investor)/versoholdings/deal/[id]/page.tsx | Deal detail view with reservation hooks. |
| /versoholdings/vehicle/[id] | src/app/(investor)/versoholdings/vehicle/[id]/page.tsx | Vehicle detail tabs (positions, docs, cashflows). |
| /versoholdings/documents | src/app/(investor)/versoholdings/documents/page.tsx | Document center listing with download flow. |
| /versoholdings/messages | src/app/(investor)/versoholdings/messages/page.tsx | Investor messaging UI. |
| /versoholdings/reports | src/app/(investor)/versoholdings/reports/page.tsx | Quick report requests + history. |
| /versoholdings/tasks | src/app/(investor)/versoholdings/tasks/page.tsx | Onboarding/task tracker. |
| /versotech/staff | src/app/(staff)/versotech/staff/page.tsx | Staff operations dashboard. |
| /versotech/staff/requests | src/app/(staff)/versotech/staff/requests/page.tsx | Request inbox triage UI. |
| /versotech/staff/processes | src/app/(staff)/versotech/staff/processes/page.tsx | Workflow/process center launcher. |
| /versotech/staff/deals | src/app/(staff)/versotech/staff/deals/page.tsx | Staff deal management list. |
| /versotech/staff/deals/[id] | src/app/(staff)/versotech/staff/deals/[id]/page.tsx | Deal detail for inventory/reservations/allocations. |
| /versotech/staff/investors | src/app/(staff)/versotech/staff/investors/page.tsx | Investor directory for staff. |
| /versotech/staff/documents | src/app/(staff)/versotech/staff/documents/page.tsx | Staff document workspace. |
| /versotech/staff/documents/automation | src/app/(staff)/versotech/staff/documents/automation/page.tsx | Doc package automation + e-sign tracking. |
| /versotech/staff/fees | src/app/(staff)/versotech/staff/fees/page.tsx | Fee events and invoicing UI. |
| /versotech/staff/reconciliation | src/app/(staff)/versotech/staff/reconciliation/page.tsx | Bank transaction reconciliation flows. |
| /versotech/staff/approvals | src/app/(staff)/versotech/staff/approvals/page.tsx | Approvals queue UI. |
| /versotech/staff/introducers | src/app/(staff)/versotech/staff/introducers/page.tsx | Introducer and attribution management. |
| /versotech/staff/audit | src/app/(staff)/versotech/staff/audit/page.tsx | Audit log review page. |
| /versotech/staff/admin | src/app/(staff)/versotech/staff/admin/page.tsx | Staff admin utilities. |

## Shared Component Buckets

| Directory | Focus | Notes |
| --- | --- | --- |
| src/components/layout | App layout pieces | Contains AppLayout, sidebar, headers shared across portals. |
| src/components/ui | Local UI primitives | Tailwind-based variants (buttons, cards, badges). Candidate for shadcn replacement. |
| src/components/dashboard | Investor summaries | KPI cards, charts for investor home. |
| src/components/deals | Deal workflows | Reservation modals, allocation review widgets. |
| src/components/documents | Document UIs | Document tables, download dialogs, watermark hints. |
| src/components/forms | Form helpers | React-hook-form wrappers, validation utilities. |
| src/components/messaging | Chat surfaces | Conversation list, composer, read receipts. |
| src/components/staff | Staff-only widgets | Ops dashboard tiles, workflow cards, SLA labels. |
| src/components/charts | Chart.js wrappers | Sparkline and donut chart helpers. |
| src/components/icons | Custom icons | Brand-specific SVG icons. |
| src/components/auth | Login UI | Demo credential components. |

> Regenerate this inventory whenever routes/components shift to keep refactor plan aligned.
