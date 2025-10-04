# Reports & Ask Center - Implementation Complete

## Overview

The Reports & Ask Center feature has been fully implemented for the investor portal, allowing investors to:

1. **Generate 4 Quick Reports** instantly via automated workflows
2. **Submit Custom Requests** to the team at biz@realest.com
3. **Track Status** of all reports and requests in real-time
4. **Download Results** when ready

---

## What Was Implemented

### ✅ Database Layer
- **Migration**: [database/migrations/012_enhance_reports_and_requests.sql](database/migrations/012_enhance_reports_and_requests.sql)
  - Enhanced `report_requests` table with `report_type`, `workflow_run_id`, `error_message`, `completed_at`
  - Enhanced `request_tickets` table with `due_date`, `completion_note`, `closed_at`, `updated_at`
  - Auto-SLA calculation function `calculate_request_sla()` (high=1d, normal=3d, low=7d)
  - Auto-triggers for `due_date` and `updated_at` timestamps
  - Performance indexes for queries
  - Helper views: `overdue_requests`, `report_request_stats`

### ✅ Type Definitions
- **File**: [src/types/reports.ts](src/types/reports.ts)
  - Complete TypeScript types for all entities
  - Enums: `ReportType`, `ReportStatus`, `RequestStatus`, `RequestCategory`, `RequestPriority`
  - Database interfaces: `ReportRequest`, `RequestTicket`
  - Extended types with relations
  - API request/response types
  - Type guards for runtime validation

### ✅ Business Logic
- **Constants**: [src/lib/reports/constants.ts](src/lib/reports/constants.ts)
  - 4 predefined reports (exactly as user specified):
    1. **Our Position Statement** (5min SLA)
    2. **Quarterly Report** (10min SLA)
    3. **Monthly Report** (10min SLA)
    4. **Yearly Report (Ghiles)** (15min SLA)
  - Custom request categories and priority configs
  - SLA tracking and helper functions

- **Validation**: [src/lib/reports/validation.ts](src/lib/reports/validation.ts)
  - Input validation functions
  - Sanitization helpers
  - Error formatting

### ✅ Backend APIs

#### Report Requests API
- **GET** [/api/report-requests](src/app/api/report-requests/route.ts)
  - List all report requests with pagination
  - Includes related investor and document data

- **POST** [/api/report-requests](src/app/api/report-requests/route.ts)
  - Create new report request
  - Duplicate detection (5-minute window)
  - Triggers n8n workflow
  - Creates activity feed entry

- **GET** [/api/report-requests/[id]](src/app/api/report-requests/[id]/route.ts)
  - Fetch individual report status
  - Progress calculation

#### Custom Requests API
- **GET** [/api/requests](src/app/api/requests/route.ts)
  - List all custom requests
  - Returns overdue count

- **POST** [/api/requests](src/app/api/requests/route.ts)
  - Submit custom request
  - Auto-calculates due_date via database trigger
  - Creates activity feed entry

- **GET** [/api/requests/[id]](src/app/api/requests/[id]/route.ts)
  - Fetch request details with relations

- **PATCH** [/api/requests/[id]](src/app/api/requests/[id]/route.ts)
  - Update request (staff only)
  - Status transitions with auto-timestamps
  - Activity feed updates

#### n8n Webhook Integration
- **POST** [/api/webhooks/n8n](src/app/api/webhooks/n8n/route.ts)
  - HMAC signature verification
  - Updates `workflow_runs` status
  - Creates `documents` record for generated files
  - Updates `report_requests` status to 'ready' or 'failed'
  - Creates activity feed entries
  - Audit logging

#### Document Download
- **GET** [/api/documents/[id]/download](src/app/api/documents/[id]/download/route.ts)
  - Pre-signed URL generation (15min expiry)
  - Audit logging
  - Watermark metadata

### ✅ Frontend Components (shadcn)

1. **[QuickReportCard](src/components/reports/quick-report-card.tsx)**
   - Card-based report generation button
   - Icon mapping, hover effects
   - Loading states with Loader2

2. **[CustomRequestModal](src/components/reports/custom-request-modal.tsx)**
   - Full Dialog with form
   - Category, subject, details, priority selectors
   - SLA display based on priority
   - Email reference: **biz@realest.com**

3. **[ReportStatusBadge](src/components/reports/report-status-badge.tsx)**
   - Unified status badge for reports and requests
   - Color-coded variants
   - Animated icons (spinning loader for 'processing')

4. **[RecentReportsList](src/components/reports/recent-reports-list.tsx)**
   - Card list of generated reports
   - Status badges, download buttons
   - Error message display
   - Empty state handling

5. **[ActiveRequestsList](src/components/reports/active-requests-list.tsx)**
   - **Task-style layout** (as requested)
   - Separates active vs closed requests
   - Overdue warnings with AlertTriangle
   - Shows assigned staff member
   - Completion notes display
   - Download results button

### ✅ Main Page
- **[Reports Page (Server Component)](src/app/(investor)/versoholdings/reports/page.tsx)**
  - Server-side data fetching for initial load
  - Authentication and authorization
  - Passes data to client component

- **[Reports Page Client](src/components/reports/reports-page-client.tsx)**
  - Integrates all interactive components
  - Real-time Supabase subscriptions for status updates
  - Toast notifications (using sonner) for status changes
  - Data fetching from APIs
  - Download handler with pre-signed URLs
  - Empty state handling

---

## Business Requirements Met

✅ **Only 4 predefined reports** (not 5):
  1. Our Position Statement
  2. Quarterly Report
  3. Monthly Report
  4. Yearly Report (Ghiles)

✅ **Custom requests** submitted to **biz@realest.com**

✅ **Task-like UI** for custom requests with:
  - Status badges
  - Overdue tracking
  - Completion notes
  - Clear visual separation

✅ **shadcn components** used throughout:
  - Card, Dialog, Button, Badge, Select, Input, Textarea
  - Proper variants and styling

---

## Key Features

### 🚀 Quick Report Generation
- One-click report generation
- Automatic workflow triggering
- Real-time status updates via Supabase subscriptions
- Toast notifications when reports are ready

### 📝 Custom Requests
- Simple submission form
- Priority-based SLA calculation
- Email notification to biz@realest.com
- Task-style tracking interface

### 📊 Status Tracking
- Real-time updates via Supabase Realtime
- Color-coded status badges
- Overdue warnings with visual indicators
- Progress indicators

### 📥 Document Downloads
- Secure pre-signed URLs (15min expiry)
- Audit logging for compliance
- Watermark metadata
- One-click download

### 🔐 Security
- Row-Level Security (RLS) policies
- HMAC signature verification for webhooks
- Audit logging for all actions
- Staff-only update permissions

---

## How to Deploy

### 1. Apply Database Migration

```bash
# Connect to your Supabase database
psql "postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# Run the migration
\i database/migrations/012_enhance_reports_and_requests.sql
```

**OR** use Supabase MCP:

```bash
# Apply via MCP
mcp__supabase__apply_migration({
  name: "enhance_reports_and_requests",
  query: "-- paste migration content here --"
})
```

### 2. Configure Environment Variables

Ensure these are set in your `.env.local`:

```bash
# n8n Integration
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook
N8N_WEBHOOK_SECRET=your-secret-key

# Supabase Storage
STORAGE_BUCKET_NAME=documents

# App URL for webhook callbacks
NEXT_PUBLIC_APP_URL=https://portal.yourdomain.com
```

### 3. Build and Deploy

```bash
cd versotech-portal
npm install
npm run build
npm run dev  # or deploy to production
```

### 4. Configure n8n Workflows

Create 4 workflows in n8n (one for each report type):

1. **positions_statement** workflow
2. **quarterly_report** workflow
3. **monthly_report** workflow
4. **yearly_report_ghiles** workflow

Each workflow should:
- Accept webhook trigger with `report_request_id`, `investor_id`, `filters`
- Generate the report (PDF/Excel)
- Upload to Supabase Storage
- Call back to `/api/webhooks/n8n` with:
  ```json
  {
    "workflow_run_id": "uuid",
    "report_request_id": "uuid",
    "status": "completed" | "failed",
    "error_message": "string (if failed)",
    "artifacts": {
      "document": {
        "file_key": "path/to/file.pdf",
        "type": "report",
        "owner_investor_id": "uuid",
        "vehicle_id": "uuid (optional)"
      }
    },
    "original_user_id": "uuid"
  }
  ```

---

## API Endpoints Reference

### Report Requests
- `GET /api/report-requests` - List reports (with pagination)
- `POST /api/report-requests` - Generate new report
- `GET /api/report-requests/[id]` - Get report status

### Custom Requests
- `GET /api/requests` - List custom requests
- `POST /api/requests` - Submit custom request
- `GET /api/requests/[id]` - Get request details
- `PATCH /api/requests/[id]` - Update request (staff only)

### Webhooks
- `POST /api/webhooks/n8n` - n8n workflow completion callback

### Documents
- `GET /api/documents/[id]/download` - Get pre-signed download URL

---

## Testing Checklist

### Quick Reports
- [ ] Click "Generate" on each of the 4 report types
- [ ] Verify report_request created with status 'queued'
- [ ] Verify n8n workflow triggered
- [ ] Verify status updates to 'processing' then 'ready'
- [ ] Verify toast notification appears when ready
- [ ] Verify download button appears and works
- [ ] Verify duplicate detection (generate same report twice within 5min)

### Custom Requests
- [ ] Click "Submit Custom Request" button
- [ ] Fill out form with all fields
- [ ] Verify request_ticket created with status 'open'
- [ ] Verify due_date auto-calculated based on priority
- [ ] Verify appears in Active Requests list
- [ ] Verify shows as "task-style" card
- [ ] Verify overdue warning appears after SLA
- [ ] Staff: Update status to 'in_progress'
- [ ] Staff: Attach result document
- [ ] Staff: Add completion note
- [ ] Staff: Close request
- [ ] Verify completion note appears
- [ ] Verify download button works

### Real-time Updates
- [ ] Open page in two browser tabs
- [ ] Generate report in tab 1
- [ ] Verify status updates appear in tab 2 without refresh
- [ ] Submit custom request in tab 1
- [ ] Verify appears in tab 2 without refresh

### Downloads
- [ ] Click download on completed report
- [ ] Verify pre-signed URL opens in new tab
- [ ] Verify file downloads successfully
- [ ] Verify audit log created

---

## Future Enhancements

### Short-term
- [ ] Add filters to reports (date range, vehicle selection)
- [ ] Add retry button for failed reports
- [ ] Add request attachments support
- [ ] Email notifications to investors

### Long-term
- [ ] Report scheduling (e.g., auto-generate monthly)
- [ ] Report templates/favorites
- [ ] Bulk report generation for staff
- [ ] Advanced analytics dashboard
- [ ] Report comparison tools

---

## Support

For questions or issues:
- **Email**: biz@realest.com
- **Documentation**: [PRD](docs/investor/Reports_Page_PRD.md)
- **Code**: This implementation

---

**Implementation Date**: January 3, 2025
**Status**: ✅ Complete and Ready for Testing
